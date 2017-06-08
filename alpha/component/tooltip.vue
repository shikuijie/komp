<template>
  <div class="af-tooltip" 
      :class="{_af_tooltip_visible: status.visible}"
      :style="tipStyle" 
      @click.stop
      @mouseenter.stop="mouseenter"
      @mouseleave.stop="mouseleave">
      <af-triangle :direction="direction" :style="triangleStyle"></af-triangle>
      <div class="_af_tooltip_border" :class="`_af_${direction}`"></div>
    <slot :context="context" :extra="extra"></slot>
  </div>
</template>
<script>
  import {isNumber, getElementPosition, hasVnodeListener} from './util'
  import afTriangle from './triangle.vue'
  import Bus from './bus'
  
  const BUS = {}
  document.documentElement.addEventListener('click', () => {
    if (BUS.__afCurrent) {
      BUS.__afCurrentBus.$emit('__afHide')
    }
  })

  export default {
    components: {
      afTriangle
    },
    props: {
      bus: {
        type: Bus,
        required: true
      },
      init: {
        default () {
          return {}
        }
      },
      initExtra: {
        default () {
          return {}
        }
      }
    },
    data () {
      return {
        context: this.init,
        extra: this.initExtra,
        status: {visible: false},
        direction: 'left',
        style: {
          tip: {
            left: 0,
            top: 0
          },
          triangle: {
            left: 0,
            top: 0,
            bottom: 'auto',
            right: 'auto'
          }
        }
      }
    },
    created () {
      this.bus.__afStatus = this.status
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afPreshowHandler = hasVnodeListener(this.$vnode, 'preshow')

      this.bus.__afInit = this.init
      this.bus.__afInitExtra = this.initExtra
      // 内部事件
      this.__af_showId = this.bus.$on('__afShow', (context, extra) => {
        var el = this.bus.__afEls.get(context)
        if (!el) {
          return
        }

        new Promise(resolve => {
          if (this.__afPreshowHandler) {
            this.$emit('preshow', extra && [context, extra, resolve] || [context, resolve])
          } else {
            resolve(true)
          }
        }).then(ok => {
          if (!ok) {
            return
          }

          if (this.__afShowHandler) {
            this.$emit('show', extra && [context, extra] || context)
          }

          if (this.bus.__afClick) {
            BUS.__afCurrent = context
            BUS.__afCurrentBus = this.bus
          }

          this.context = context
          this.extra = extra
          window.setTimeout(() => {
            this.showElm(el)
          })
        })
      })
      this.__af_hideId = this.bus.$on('__afHide', cb => {
        if (this.__afHideHandler) {
          this.$emit('hide', this.extra && [this.context, this.extra] || this.context)
        }

        this.status.visible = false
        this.context = this.init
        this.extra = this.initExtra
        this.bus.__afHoverOn = null

        if (this.bus.__afClick) {
          BUS.__afCurrent = null
          BUS.__afCurrentBus = null
        }

        cb && cb()
      })

      // 供用户在外部调用
      this.__afShowId = this.bus.$on('show', (context, extra) => {
        if (this.status.visible) {
          if (BUS.__afCurrent === context) {
            return
          } else {
            this.bus.$emit('__afHide', () => {
              this.bus.$emit('__afShow', context, extra)
            })
          }
        } else {
          if (BUS.__afCurrent) {
            // 隐藏当前tooltip，显示el的tooltip
            BUS.__afCurrentBus.$emit('__afHide', () => {
              this.bus.$emit('__afShow', context, extra)
            })
          } else {
            this.bus.$emit('__afShow', context, extra)
          }
        }
      })
      this.__afHideId = this.bus.$on('hide', () => {
        if (!BUS.__afCurrent) {
          return
        }
        this.bus.$emit('__afHide')
      })
    },
    destroyed () {
      this.bus.$off('show', this.__afShowId)
      this.bus.$off('hide', this.__afHideId)
      this.bus.$off('__afShow', this.__af_showId)
      this.bus.$off('__afHide', this.__af_hideId)
    },
    methods: {
      showElm (target) {
        var vertical = target.__afVertical
        var width = this.$el.offsetWidth
        var height = this.$el.offsetHeight
        var parent = getElementPosition(this.$el.offsetParent)
        var tip = this.style.tip
        var triangle = this.style.triangle
        var sl = window.pageXOffset || document.documentElement.scrollLeft
        var st = window.pageYOffset || document.documentElement.scrollTop
        var ww = document.documentElement.clientWidth
        var wh = document.documentElement.clientHeight

        var rect = getElementPosition(target)
        if (vertical) {
          if (rect.left - 8 - width > sl) {
            // 显示在左方
            tip.left = rect.left - 8 - width - parent.left
            triangle.right = -7
            triangle.left = 'auto'
            this.direction = 'left'
          } else {
            // 显示在右方
            tip.left = rect.right + 8 - parent.left
            triangle.left = -7
            triangle.right = 'auto'
            this.direction = 'right'
          }

          let center = (rect.top + rect.bottom) / 2
          if (center - height / 2 >= st && center + height / 2 <= wh + st) {
            // 居中
            tip.top = center - height / 2 - parent.top
            triangle.top = height / 2 - 7
            triangle.bottom = 'auto'
          } else if (center - height / 2 < st) {
            // 下移
            tip.top = st - parent.top
            triangle.top = center - st - 7
            triangle.bottom = 'auto'
          } else {
            // 上移
            tip.top = st + wh - height - parent.top
            triangle.bottom = st + wh - center - 7
            triangle.top = 'auto'
          }
        } else {
          // if (rect.bottom + 8 + height < wh + st) {
          // 显示在下方
          tip.top = rect.bottom + 8 - parent.top
          triangle.top = -7
          triangle.bottom = 'auto'
          this.direction = 'down'
          // } else {
          //   // 显示在上方
          //   tip.top = rect.top - 8 - parent.top - height
          //   triangle.bottom = -7
          //   triangle.top = 'auto'
          //   this.direction = 'up'
          // }

          let center = (rect.left + rect.right) / 2
          if (center - width / 2 >= sl && center + width / 2 <= ww + sl) {
            // 居中
            tip.left = center - width / 2 - parent.left
            triangle.left = width / 2 - 7
            triangle.right = 'auto'
          } else if (center - width / 2 < sl) {
            // 右移
            tip.left = sl - parent.left
            triangle.left = center - sl - 7
            triangle.right = 'auto'
          } else {
            // 左移
            tip.left = ww + sl - width - parent.left
            triangle.right = ww + sl - center - 7
            triangle.left = 'auto'
          }
        }

        this.status.visible = true
      },
      computeStyle (obj) {
        return obj && ['left', 'top', 'right', 'bottom'].reduce((res, key) => {
          var val = isNumber(obj[key]) ? (obj[key] + 'px') : obj[key]
          res[key] = val
          return res
        }, {})
      },
      mouseenter () {
        if (this.bus.__afHover) {
          this.bus.__afHoverOn = true
        }
      },
      mouseleave () {
        if (this.bus.__afHover) {
          this.bus.__afHoverOn = false
          window.setTimeout(() => {
            // 鼠标离开tooltip进入el时不需要隐藏tooltip
            if (!this.bus.__afHoverOn) {
              this.bus.$emit('__afHide')
            }
          })
        }
      }
    },
    computed: {
      tipStyle () {
        return this.computeStyle(this.style && this.style.tip)
      },
      triangleStyle () {
        return this.computeStyle(this.style && this.style.triangle)
      }
    },
    Directive: {
      unbind (el, binding, vnode) {
        var bus = getDirectiveData(binding.value)[0]
        bus.__afEls && bus.__afEls.delete(el.__afContext)
        el.__afContext = bus.__afInit
        el.__afExtra = bus.__afInitExtra

        el.__afClickHandler && el.removeEventListener('click', el.__afClickHandler)
        el.__afEnterHandler && el.removeEventListener('mouseenter', el.__afEnterHandler)
        el.__afLeaveHandler && el.removeEventListener('mouseleave', el.__afLeaveHandler)
      },
      componentUpdated (el, binding, vnode) {
        var [bus, context, extra] = getDirectiveData(binding.value)

        if (bus.__afEls) {
          bus.__afEls.delete(el.__afContext)
          bus.__afEls.set(context, el)
        }
        el.__afContext = context
        el.__afExtra = extra
      },
      bind (el, binding, vnode) {
        var [bus, context, extra] = getDirectiveData(binding.value)

        el.__afContext = context
        el.__afExtra = extra
        el.__afVertical = binding.modifiers.vertical

        bus.__afHover = !binding.modifiers.click
        bus.__afClick = !bus.__afHover
        bus.__afEls = bus.__afEls || new Map()
        if (bus.__afEls.get(context)) {
          throw new Error('more than one elements bound to same tooltip has the same context')
        }
        bus.__afEls.set(context, el)

        function enterHandler ($event) {
          $event.stopPropagation()
          // 当鼠标从外部进入el时__afHoverOn为null
          // 当鼠标从tooltip进入el时__afHoverOn为false
          if (bus.__afHoverOn === null) {
            bus.$emit('__afShow', el.__afContext, el.__afExtra)
          }
          bus.__afHoverOn = true
        }
        function leaveHandler ($event) {
          $event.stopPropagation()
          bus.__afHoverOn = false
          window.setTimeout(() => {
            // 鼠标离开el进入到tooltip时不需要隐藏tooltip
            if (!bus.__afHoverOn) {
              bus.$emit('__afHide')
            }
          })
        }
        function clickHandler ($event) {
          $event.stopPropagation()
          if (bus.__afStatus.visible) {
            if (BUS.__afCurrent === context) {
              // tooltip和el绑定
              bus.$emit('__afHide')
            } else {
              // tooltip和另一个元素绑定
              bus.$emit('__afHide', () => {
                bus.$emit('__afShow', el.__afContext, el.__afExtra)
              })
            }
          } else {
            if (BUS.__afCurrent) {
              // 隐藏当前tooltip，显示el的tooltip
              BUS.__afCurrentBus.$emit('__afHide', () => {
                bus.$emit('__afShow', el.__afContext, el.__afExtra)
              })
            } else {
              bus.$emit('__afShow', el.__afContext, el.__afExtra)
            }
          }
        }

        if (bus.__afHover) {
          bus.__afHoverOn = null
          el.addEventListener('mouseenter', enterHandler)
          el.__afEnterHandler = enterHandler

          el.addEventListener('mouseleave', leaveHandler)
          el.__afLeaveHandler = leaveHandler
        } else {
          el.addEventListener('click', clickHandler)
          el.__afClickHandler = clickHandler
        }
      }
    }
  }

  function getDirectiveData (value) {
    var bus = null
    var context = null
    var extra = null
    if (value instanceof Bus) {
      bus = value
      context = {}
    } else {
      bus = value.bus
      context = value.context || {}
      extra = value.extra
    }

    return [bus, context, extra]
  }
</script>
<style lang="less">
  @import (reference) '../style/variable.less';

  .af-tooltip {
    position: absolute;
    border: 1px solid @border-light;
    border-radius: 2px;
    background: white;
    box-shadow: 0 2px 3px rgba(0,0,0,.08);

    visibility: hidden;
    z-index: -1;
    opacity: 0;

    &._af_tooltip_visible {
      opacity: 1;
      visibility: visible;
      z-index: @zindex-tooltip;
    }

    ._af_tooltip_border {
      position: absolute;
      &._af_left {
        top: 0;
        right: -9px;
        height: 100%;
        border-left: 9px solid transparent;
      }
      &._af_right {
        top: 0;
        left: -9px;
        height: 100%;
        border-left: 9px solid transparent;
      }
      &._af_down {
        left: 0;
        top: -9px;
        width: 100%;
        border-top: 9px solid transparent;
      }
      &._af_up {
        left: 0;
        bottom: -9px;
        width: 100%;
        border-top: 9px solid transparent;
      }
    }
  }
</style>
