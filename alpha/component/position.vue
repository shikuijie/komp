<template>
  <div class="af-position" :style="{overflow: visible ? '' : 'hidden'}">
    <input class="af-input-control" type="text"
            :class="{'af-focus': visible, 'af-disabled': disabled}"
            readonly
            :placeholder="placeholder" 
            :value="valueStr" 
            @click.stop="toggle">
    <i v-if="!removable" @click.stop="toggle" class="_af_position_caret icon-arrow-down"></i>
    <i v-else class="af-cursor _af_position_caret icon-close" @click.stop="remove"></i>
    <af-dropdown :visible="visible" @hide="toggle">
      <ul class="_af_position_level1" @click.stop="select" v-show="cache.list.length">
        <li v-for="t in cache.list"
            :class="{_af_position_active: active1 === t}"
            @mouseenter.stop="hoverIn(1, t)">
          <span>{{t.name}}</span>
          <ul class="_af_position_level2" v-show="active1 === t">
            <li v-for="st in t.list"
                :class="{_af_position_active: active2 === st}"
                @mouseenter.stop="hoverIn(2, st)">
              <span>{{st.name}}</span>
              <ul class="_af_position_level3" v-show="active2 === st">
                <li v-for="it in st.list"
                    @click="selectLeaf(it)">
                  <span>{{it.name}}</span>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </af-dropdown>
  </div>
</template>
<script>
  import afDropdown from './dropdown.vue'
  import Bus from './bus'
  import {hasVnodeListener, isUndefined} from './util'

  const CACHE = {
    /**
     * list: [{id: 1, name: '技术', list: []}]
     */
    list: []
  }

  export default {
    name: 'form-position',
    components: {
      afDropdown
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')
      this.__afLeafHandler = hasVnodeListener(this.$vnode, 'leaf')

      if (this.__afControlBus) {
        this.__afGetValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)

        this.__afDetailId = this.__afControlBus.$on('position', () => {
          var ids = this.value && this.value.split('-')
          var names = this.valueStr && this.valueStr.split('-')
          if (ids && ids.length >= 2 && names && names.length >= 2) {
            return {
              level1: {
                id: ids[0],
                name: names[0]
              },
              level2: {
                id: ids[1],
                name: names[1]
              }
            }
          }
        })
      }

      this.init(this.value)
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__afGetValueId)
        this.__afControlBus.$off('position', this.__afDetailId)
      }
    },
    props: {
      value: null,
      disabled: Boolean,
      clear: {
        type: String,
        validator (val) {
          return !val
        }
      },
      placeholder: String,
      __afControlBus: Bus
    },
    data () {
      return {
        cache: CACHE,
        visible: false,
        active1: null,
        active2: null
      }
    },
    computed: {
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null
      },
      valueStr () {
        var ids = this.value && this.value.split('-') || []
        if (ids.length >= 2) {
          let current1 = this.cache.list.find(el => el.id === +ids[0])
          let current2 = current1 && current1.list.find(el => el.id === +ids[1])
          return current2 && `${current1.name}-${current2.name}`
        }
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
        this.init(val)
      }
    },
    methods: {
      init (val) {
        var ids = val && val.split('-') || []
        this.fetch(this.cache, level1 => {
          if (level1 && level1.length) {
            this.active1 = ids[0] && (level1.find(el => el.id === +ids[0])) || level1[0]
            this.fetch(this.active1, level2 => {
              if (level2 && level2.length) {
                this.active2 = ids[1] && (level2.find(el => el.id === +ids[1])) || level2[0]
                this.fetch(this.active2)
              }
            })
          }
        })
      },
      // 获取parent的子列表
      fetch (parent, cb) {
        if (parent.list.length) {
          cb && cb(parent.list)
          return
        }

        this.$emit('fetch', [list => {
          if (list && list.length) {
            if (!parent.id) {
              list = list.filter(el => ['技术', '产品', '设计', '运营', '市场与销售'].indexOf(el.name) !== -1)
            }
            list.forEach(el => {
              el.list = []
            })
            parent.list.splice(0, 0, ...list)
            cb && cb(parent.list)
          } else {
            cb && cb()
          }
        }, parent.id])
      },
      toggle () {
        if (this.disabled) {
          return
        }
        var event = this.visible ? 'hide' : 'show'
        var emit = this.visible ? this.__afHideHandler : this.__afShowHandler

        if (emit) {
          this.$emit(event)
        }
        this.visible = !this.visible

        if (!this.visible && this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      },
      select () {
        this.toggle()
        var nval = `${this.active1.id}-${this.active2.id}`
        if (nval === this.value) {
          return
        }

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
          this.$emit('change', nval)
        }
      },
      selectLeaf (item) {
        if (this.__afLeafHandler) {
          this.$emit('leaf', item.name)
        }
      },
      remove () {
        if (!this.removable) {
          return
        }

        if (!this.value) {
          return
        }
        this.$emit('input', null)
        if (this.__afChangeHandler) {
          this.$emit('change', null)
        }
      },
      hoverIn (level, item) {
        this[`active${level}`] = item
        ++level
        this.fetch(item, items => {
          if (items && items.length && level !== 3) {
            this.hoverIn(level, items[0])
          }
        })
      }
    }
  }
</script>
<style lang="less">
  @import (reference) "../style/variable.less";

  .af-position {
    display: inline-block;
    position: relative;
    width: 100%;
    color: @dark;
    font-size: 14px;
    line-height: normal;

    .af-input-control {
      padding-right: 25px;
    }

    ._af_position_caret {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: @light;
      font-size: 12px;
    }

    .af-dropdown {
      border: none;
      ul {
        height: 360px;
      }

      ._af_position_level1,
      ._af_position_level2 {
        border-right: none;
        li {
          height: 36px;
          line-height: 36px;
          padding-left: 15px;
        }
      }

      ._af_position_level2,
      ._af_position_level3 {
        position: absolute;
        left: 100%;
        top: -1px;
        border: 1px solid @border-light;
        border-left: none;
      }

      ._af_position_level1 {
        position: relative;
        width: 120px;
        border: 1px solid @border-light;
        background: @border-light;
        > li._af_position_active {
          cursor: pointer;
          background: @border-lighter;
          > span {
            color: @primary;
          }
        }
      }

      ._af_position_level2 {
        width: 150px;
        background: @border-lighter;

        > li._af_position_active {
          cursor: pointer;
          background: @bg;
          > span {
            color: @primary;
          }
        }
      }

      ._af_position_level3 {
        width: 240px;
        padding: 15px 5px;
        background: @bg;
        > li {
          display: inline-block;
          padding: 0 10px;
          border-radius: @radius;
          cursor: pointer;

          &:hover,
          &._af_position_active {
            background: @primary;
            > span {
              color: white;
            }
          }
        }
      }
    }
  }
</style>