<script>
  import afDropdown from '../dropdown.vue'
  import afScroll from '../scroll.vue'
  import {isUndefined, hasVnodeListener, getVnodeProps, getVnodeChildren} from '../util'
  import Bus from '../bus'
  import afCheckbox from '../checkbox.vue'

  export default {
    name: 'form-mselect',
    components: {
      afDropdown,
      afScroll,
      afCheckbox
    },
    props: {
      value: {
        type: Array,
        required: true
      },
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
        bus: this.__afControlBus && new Bus()
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    computed: {
      checked () {
        return this.value && this.__afSelectValues.every(v => this.value.indexOf(v) !== -1)
      },
      labels () {
        return this.value && this.value.map(v => this.__afSelectMap[v])
      },
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null && this.value.length
      },
      _placeholder () {
        return this.value && this.value.length ? '' : this.placeholder
      }
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__afGetValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }

      if (this.__afControlBus) {
        this.__afBusId = this.bus.$on('check', () => {
          this.__afControlBus.$emit('__afCheck', this.value)
        })
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__afGetValueId)
        this.bus.$off('check', this.__afBusId)
      }
    },
    methods: {
      slots () {
        if (!this.$slots.default) {
          return null
        }
        var slots = this.$slots.default.filter(s => s.tag)
        var self = this
        self.__afSelectValues = []
        self.__afSelectMap = {}

        function addListener (s, groupValues) {
          var props = getVnodeProps(s)
          var children = getVnodeChildren(s)

          if (s.tag.indexOf('select-optgroup') !== -1) {
            props.values = self.value
            props.groupValues = []
            props.bus = self.bus
            props.multiple = true

            children && children.filter(c => c.tag && c.tag.indexOf('select-option') !== -1).forEach(c => addListener(c, props.groupValues))
          } else if (s.tag.indexOf('select-option') !== -1) {
            groupValues && groupValues.push(props.value)
            props.values = self.value
            props.label = props.label || props.value
            props.bus = self.bus
            props.multiple = true

            self.__afSelectValues.push(props.value)
            self.__afSelectMap[props.value] = props.label
          }
        }

        slots.forEach(c => addListener(c))
        return slots
      },
      toggle () {
        if (this.disabled || !this.value) {
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
      selectAll () {
        var val = !this.checked
        if (val) {
          this.__afSelectValues.forEach(v => {
            if (this.value.indexOf(v) === -1) {
              this.value.push(v)
            }
          })
        } else {
          this.__afSelectValues.forEach(v => {
            this.value.splice(this.value.indexOf(v), 1)
          })
        }
      },
      remove (idx) {
        if (idx || idx === 0) {
          this.value.splice(idx, 1)
        } else {
          this.value.splice(0, this.value.length)
        }
      }
    },
    render (h) {
      var slots = this.slots()
      return h('div', {
        staticClass: 'af-mselect',
        style: {
          overflow: this.visible ? '' : 'hidden'
        },
        on: {
          click ($event) {
            $event.stopPropagation()
          }
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
            placeholder: this._placeholder,
            value: this.label
          }
        }),
        h('div', {
          staticClass: '_af_mselect_caret_wrapper',
          on: {
            click: $event => {
              $event.stopPropagation()
              this.toggle()
            }
          }
        }, [
          h('i', {
            staticClass: '_af_mselect_caret ' + (this.removable ? 'af-cursor icon-close' : 'icon-arrow-down'),
            on: {
              click: $event => {
                $event.stopPropagation()
                this.remove()
              }
            }
          })
        ]),
        h('ul', {
          staticClass: '_af_mselect_items clearfix',
          on: {
            click: $event => {
              $event.stopPropagation()
              this.toggle()
            }
          }
        }, this.labels && this.labels.map((l, i) => h('li', {
          staticClass: '_af_mselect_item af-cursor',
          on: {
            click: $event => {
              $event.stopPropagation()
              this.remove(i)
            }
          }
        }, l)))
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
          h('ul', {
            staticClass: 'clearfix'
          }, [
            h('li', {
              staticClass: '_af_mselect_all',
              on: {
                click: this.selectAll
              }
            }, [
              h(afCheckbox, {
                props: {
                  value: this.checked,
                  label: '全选'
                }
              })
            ])
          ].concat(slots))
        ])
      ]) || []))
    }
  }
</script>
<style lang="less">
  @import (reference) "../../style/variable.less";

  .af-mselect {
    display: inline-block;
    position: relative;
    width: 100%;
    font-size: 14px;
    background: #fff;

    ._af_mselect_caret_wrapper {
      position: absolute;
      height: 90%;
      width: 24px;
      top: 5%;
      right: 1px;
      background: #fff;
      z-index: 1;

      ._af_mselect_caret {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        color: @light;
        font-size: 12px;
      }
    }

    .af-input-control {
      padding-right: 25px;
    }
    ._af_mselect_items {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      padding-right: 25px;
      overflow: hidden;
      white-space: nowrap;

      ._af_mselect_item {
        display: inline-block;
        margin: 6px 3px;
        padding: 6px 8px;
        border: 1px solid @border-light;
        border-radius: @radius;

        &:hover {
          background: @hover-bg;
        }
      }
    }

    .af-dropdown {
      width: 100%;
      margin-top: 1px;

      ._af_mselect_all {
        padding-left: 10px;
      }

      ._af_mselect_all,
      ._af_optgroup_label {
        height: 30px;
        line-height: 30px;
        color: @light;
        font-size: 12px;
      }

      .af-optgroup {
        float: left;
        width: 100%;
        ._af_optgroup_label {
          padding-left: 20px;
        }
        .af-option {
          width: 100%;
          padding-left: 35px;
        }
      }

      .af-option {
        float: left;
        width: 100%;
        height: 36px;
        padding-left: 25px;
        line-height: 36px;
        text-align: left;
        color: @dark;
        cursor: pointer;

        .af-checkbox {
          width: 100%;
        }
      }

      ._af_mselect_all,
      ._af_optgroup_label,
      .af-option {
        box-sizing: border-box;
        &:hover {
          color: @primary;
          background: @hover-bg;
        }
      }
    }
  }
</style>