<template>
  <div class="af-textlist" :class="{_af_focus: active}"
       contenteditable 
       @keydown.delete="stopDel"
       @paste.stop="paste"
       @focus="active = true"
       @blur.stop="blur">
    <div class="_af_list_head" contenteditable="false">
      <i class="icon-unorderedList" @click.stop="li('ul')"></i>
      <i class="icon-orderedList" @click.stop="li('ol')"></i>
    </div>
    <div class="_af_editor_wrapper">
      <div class="af-textlist-editor" ref="editor" v-html="valueStr" @mousemove.stop="select">
      </div>
    </div>
  </div>
</template>
<script>
  import Bus from 'ui/bus'
  import {hasVnodeListener} from 'ui/util'

  export default {
    name: 'form-textlist',
    mounted () {
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__afGetValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__afGetValueId)
      }
    },
    props: {
      value: null,
      placeholder: String,
      disabled: {
        type: Boolean,
        default: false
      },
      __afControlBus: Bus
    },
    data () {
      return {
        active: false
      }
    },
    computed: {
      valueStr () {
        return this.value &&
                (/<p|ul|ol>/.test(this.value) &&
                  this.value ||
                  this.value.split('\n').map((str, i) => `<p>${!i && '&#65279;' || ''}${str}</p>`).join('')) ||
                '<p>&#65279;</p>'
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    methods: {
      paste ($event) {
        $event.preventDefault()
        var text = $event.clipboardData.getData('text/plain')
        document.execCommand('insertHTML', false, text)
      },
      stopDel ($event) {
        var editor = this.$refs.editor
        var text = editor.innerText
        if (!text.trim().length) {
          if (text.length <= 2 && editor.children.length === 1) {
            $event.preventDefault()
          }
          let inner = editor.children[editor.children.length - 1]
          let oul = {ul: true, ol: true}
          let tagName = inner.tagName.toLowerCase()
          if (oul[tagName]) {
            this.li(tagName)
          }
        }
      },
      select () {
        try {
          this.__afRange = window.getSelection().getRangeAt(0)
        } catch (e) {
          this.__afRange = null
        }
      },
      // 根据选中的元素调整DOM结构
      convert (target) {
        var targetEl = null
        var validTags = {p: true, li: true, ul: true, ol: true, div: true}
        var [start, end, ancestor] = ['startContainer', 'endContainer', 'commonAncestorContainer'].map(k => {
          var container = this.__afRange[k]
          while (container && (!container.tagName || !validTags[container.tagName.toLowerCase()])) {
            container = container.parentElement
          }
          return container
        })

        var ancestorTagName = ancestor.tagName.toLowerCase()
        if (ancestorTagName === 'li') {
          ancestor = ancestor.parentElement
          ancestorTagName = ancestor.tagName.toLowerCase()
        }

        var oul = {ul: true, ol: true}
        var divp = {p: true, div: true}
        if (!oul[ancestorTagName]) { // 将选中区域中的文本插入到一个类型为target的节点中
          if (start.tagName.toLowerCase() === 'li') { // 处理和start隶属于同一个父节点并且在start之前的li
            let startParent = start.parentElement
            if (start.previousSibling) {
              let startPrevs = document.createElement(startParent.tagName)
              while (start.previousSibling) {
                startPrevs.appendChild(startParent.childNodes[0])
              }
              startParent.parentElement.insertBefore(startPrevs, startParent)
            }
            start = startParent
          }
          if (end.tagName.toLowerCase() === 'li') { // 处理和end隶属于同一个父节点并且在end之后的li
            let endParent = end.parentElement
            if (end.nextSibling) {
              let endNexts = document.createElement(endParent.tagName)
              while (end.nextSibling) {
                endNexts.appendChild(end.nextSibling)
              }
              endParent.parentElement.insertBefore(endNexts, endParent.nextSibling)
            }
            end = endParent
          }

          // 此时start和end是同一级的元素
          targetEl = document.createElement(target)
          let parentEl = start.parentElement
          let endNext = end.nextSibling
          while (start !== endNext) {
            if (start.nodeType === document.ELEMENT_NODE) {
              if (oul[start.tagName.toLowerCase()]) {
                for (let child of [].slice.apply(start.children)) {
                  targetEl.appendChild(child)
                }
              } else if (divp[start.tagName.toLowerCase()]) {
                let el = document.createElement('li')
                for (let text of [].slice.apply(start.childNodes)) {
                  el.appendChild(text)
                }
                targetEl.appendChild(el)
              }
            }

            let temp = start
            start = start.nextSibling
            temp.remove()
          }
          parentEl.insertBefore(targetEl, endNext)
        } else { // 选中的是同一个ul或ol节点下的li元素
          var ancestorParent = ancestor.parentElement
          // 原来的ancestor被分割成三部分：(, start) [start, end] (end, )
          if (end.nextSibling) { // 处理(end, )里的元素
            let ancestorNextSibling = document.createElement(ancestorTagName)
            while (end.nextSibling) {
              ancestorNextSibling.appendChild(end.nextSibling)
            }
            ancestorParent.insertBefore(ancestorNextSibling, ancestor.nextSibling)
          }
          if (start.previousSibling) { // 处理(, start)里的元素
            let ancestorPrevSibling = document.createElement(ancestorTagName)
            while (start.previousSibling) {
              ancestorPrevSibling.appendChild(ancestor.childNodes[0])
            }
            ancestorParent.insertBefore(ancestorPrevSibling, ancestor)
          }

          // 此时ancestor中的元素就是[start, end]中的元素
          if (ancestorTagName === target) { // 将li换成p
            for (let child of [].slice.apply(ancestor.children)) {
              targetEl = document.createElement('p')
              for (let text of [].slice.apply(child.childNodes)) {
                targetEl.appendChild(text)
              }
              ancestorParent.insertBefore(targetEl, ancestor)
            }
          } else { // 翻转li的父节点类型：ul <-> ol
            targetEl = document.createElement(target)
            for (let child of [].slice.apply(ancestor.children)) {
              targetEl.appendChild(child)
            }
            ancestorParent.insertBefore(targetEl, ancestor)
          }
          ancestor.remove()
        }

        return targetEl
      },
      li (tag) {
        if (!this.__afRange) {
          return
        }

        var sel = window.getSelection()
        var range = document.createRange()
        var {startContainer, startOffset, endContainer, endOffset} = this.__afRange

        range.setStart(startContainer, startOffset)
        range.setEnd(endContainer, endOffset)
        sel.removeAllRanges()
        sel.addRange(range)

        var targetEl = this.convert(tag)
        this.setCursorEnd(targetEl)
      },
      // 将鼠标定位到元素的末尾
      setCursorEnd (el) {
        var sel = window.getSelection()
        var range = document.createRange()
        var lastEl = [].slice.apply(el.childNodes).reverse()[0] || el
        while (lastEl && lastEl.nodeType !== document.TEXT_NODE) {
          let el = [].slice.apply(lastEl.childNodes).reverse()[0]
          lastEl = el || lastEl
          if (!el) {
            break
          }
        }
        range.setStart(lastEl, lastEl.length)
        range.setEnd(lastEl, lastEl.length)
        sel.removeAllRanges()
        sel.addRange(range)
        this.__afRange = range
      },
      blur ($event) {
        this.active = false
        this.changeValue()
        this.__afRange = null
      },
      changeValue () {
        var val = null
        var editor = this.$refs.editor
        if (editor.innerText.trim().length) {
          val = editor.innerHTML
        }

        this.$emit('input', val)
        if (this.__afChangeHandler) {
          this.$emit('change', val)
        }

        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      }
    }
  }
</script>
<style lang="less">
  @import (reference) "../style/variable.less";
  .af-textlist {
    width: 100%;
    border: 1px solid @border-light;
    border-radius: 2px;
    outline: none;

    &._af_focus {
      border-color: @primary;
    }

    ._af_list_head {
      padding: 8px 12px;
      height: 36px;
      border-bottom: 1px solid @border-lighter;
      i {
        display: inline-block;
        margin-right: 10px;
        vertical-align: middle;
        color: #bdbdbd;
        cursor: pointer;
        &:hover::before {
          font-size: 20px;
        }

        &.icon-unorderedList {
          font-size: 12px;
        }
        &.icon-orderedList {
          font-size: 14px;
        }
      }
    }

    ._af_editor_wrapper {
      padding: 10px;
      background: #fff;

      .af-textlist-editor {
        line-height: 1.666;
        overflow-y: auto;
        outline: none;
        color: @dark; 

        p {
          margin: 0;
        }

        ul {
          list-style: disc;
          margin-left: 2.5em;
        }
        ol {
          margin: 0 0 0 2.5em;
          padding: 0;
        }
      }
    }
  }
</style>