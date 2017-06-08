<script>
  import afDropdown from '../dropdown.vue'
  import afScroll from '../scroll.vue'
  import {isUndefined, hasVnodeListener, getVnodeProps, getVnodeListeners, getVnodeChildren} from '../util'
  import Bus from '../bus'

  export default {
    name: 'form-select',
    components: {
      afDropdown,
      afScroll
    },
    props: {
      value: null,
      disabled: {
        type: Boolean,
        default: false
      },
      clear: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      placeholder: String,
      __afControlBus: Bus
    },
    data () {
      return {
        visible: false,
        selected: {
          label: null,
          value: this.value
        }
      }
    },
    computed: {
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null
      }
    },
    watch: {
      value (val) {
        this.selected.label = null
        this.selected.value = val
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__af_getValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__af_getValueId)
      }
    },
    methods: {
      slots () {
        if (!this.$slots.default) {
          return null
        }
        var slots = this.$slots.default.filter(s => s.tag)
        var self = this
        slots.forEach(function addListener (s) {
          var props = getVnodeProps(s)
          var children = getVnodeChildren(s)

          if (s.tag.indexOf('select-optgroup') !== -1) {
            children && children.filter(c => c.tag).forEach(c => {
              if (c.tag.indexOf('select-option') === -1) {
                if (c.data && c.data.slot === 'group') {
                  props.hasSlot = true
                } else {
                  throw new Error('slot name of optgroup must be "group"')
                }
              } else {
                addListener(c)
              }
            })
          } else if (s.tag.indexOf('select-option') !== -1) {
            props.selected = self.selected
            props.label = props.label || props.value

            let listeners = getVnodeListeners(s)
            listeners.__afSelect = self.select
          }
        })
        return slots
      },
      select (value) {
        this.toggle()
        if (value === this.selected.value) {
          return
        }

        this.$emit('input', value)
        if (this.__afChangeHandler) {
          this.$emit('change', value)
        }
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
      remove ($event) {
        $event.stopPropagation()
        if (!this.removable) {
          this.toggle()
          return
        }

        this.$emit('input', null)
        if (this.__afChangeHandler) {
          this.$emit('change', null)
        }
      }
    },
    render (h) {
      var slots = this.slots()
      return h('div', {
        staticClass: 'af-select',
        style: {
          overflow: this.visible ? '' : 'hidden'
        }
      }, [
        h('input', {
          staticClass: 'af-input-control',
          class: {
            'af-focus': this.visible,
            'af-disabled': this.disabled
          },
          attrs: {
            type: 'text',
            readonly: '',
            placeholder: this.placeholder,
            value: (this.selected.value || this.selected.value === 0) && this.selected.label
          },
          on: {
            click: $event => {
              $event.stopPropagation()
              this.toggle()
            }
          }
        }),
        h('i', {
          staticClass: '_af_select_caret ' + (this.removable ? 'af-cursor icon-close' : 'icon-arrow-down'),
          on: {
            click: this.remove
          }
        })
      ].concat(slots && h(afDropdown, {
        props: {
          visible: this.visible
        },
        on: {
          hide: this.toggle
        }
      }, [
        h(afScroll, {
          props: {
            speed: 10
          }
        }, [
          h('ul', slots)
        ])
      ]) || []))
    }
  }
</script>
<style lang="less">
  @import (reference) "../../style/variable.less";

  .af-select {
    display: inline-block;
    position: relative;
    width: 100%;
    font-size: 14px;
    background: #fff;

    ._af_select_caret {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: @light;
      font-size: 12px;
    }

    .af-input-control {
      padding-right: 25px;
    }

    .af-dropdown {
      width: 100%;
      margin-top: 1px;

      .af-optgroup ._af_optgroup_label {
        padding-left: 5px;
        height: 24px;
        line-height: 24px;
        color: @light;
        font-size: 12px;
      }

      .af-option {
        height: 36px;
        line-height: 36px;
        padding-left: 14px;
        color: @dark;
        cursor: pointer;

        &:hover,
        &._af_option_selected {
          color: @primary;
          background: @hover-bg;
        }
      }
    }
  }
</style>