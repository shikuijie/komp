<script>
import {getProps} from '../../vnode'
import Bus from '../../bus'
import Dropdown from '../dropdown.vue'
import Checkbox from '../checkbox.vue'

export default {
  name: 'km-select',
  components: {
    Dropdown,
    Checkbox
  },
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    },
    value: null,
    disabled: Boolean,
    placeholder: String,
    clearable: Boolean,
    expandable: Boolean,
    multiple: Boolean
  },
  data () {
    return {
      // 收集 Option 组件的 (label, value)
      options: {},
      level: this.multiple ? 1 : 0
    }
  },
  watch: {
    value (val, oval) {
      if (this.multiple) {
        // 多选下拉框不允许改变 value 值
        if (val !== oval) {
          throw new Error('Model change is forbidden for multiple select component!')
        }
      } else {
        if (val && !this.options[val]) {
          throw new Error('Model value of Select must be among values of Options')
        }
      }
    }
  },
  created () {
    if (this.multiple && !Array.isArray(this.value)) {
      throw new Error('Model of multiple select must be an array!')
    }

    // 将选中的 Option 组件的 value 值同步给父组件
    if (!this.multiple) {
      this.bus.$on('select', val => {
        this.$emit('input', val)
      })
    }

    // 下拉框发送 clear 事件来清空选中的数据
    this.bus.$on('clear', label => {
      if (this.multiple) {
        if (label) {
          let val = Object.keys(this.options).find(v => this.options[v] === label)
          let idx = this.value.indexOf(val)
          if (idx !== -1) {
            this.value.splice(idx, 1)
          }
        } else {
          this.value.splice(0, this.value.length)
        }
      } else {
        this.$emit('input', null)
      }
    })
  },
  destroyed () {
    if (!this.multiple) {
      this.bus.$off('select')
    }
    this.bus.$off('clear')
  },
  render (h) {
    var slots = this.$slots.default
    slots && slots.forEach(slot => {
      if (slot.tag && /km-(?:option|optgroup)/.test(slot.tag)) {
        let props = getProps(slot)
        // 给子组件添加 props
        props.selectOptions = this.options
        props.selectValue = this.value
        props.selectExpand = this.expandable
        props.multiple = this.multiple
        props.level = this.level + 1

        // 多选下拉框不需要和子组件通信
        if (!this.multiple) {
          props.selectBus = this.bus
        }
      }
    })

    return h(Dropdown, {
      staticClass: 'km-select',
      attrs: {
        multiple: this.multiple
      },
      props: {
        bus: this.bus,
        readonly: true,
        text: this.multiple ? null : this.options[this.value],
        disabled: this.disabled,
        clearable: this.clearable,
        placeholder: this.placeholder,
        labels: this.multiple ? this.value.map(val => this.options[val]) : null
      },
      on: {
        show: () => {
          this.$emit('show')
        },
        hide: () => {
          this.$emit('hide')
        }
      }
    }, [
      h('ul', [
        this.multiple && h('li', {
          staticClass: 'km_select_all',
          attrs: {
            level: this.level
          }
        }, [
          // 全选复选框
          this.multiple && h(Checkbox, {
            props: {
              label: '全选',
              value: Object.keys(this.options).every(val => this.value.indexOf(val) !== -1)
            },
            on: {
              change: val => {
                if (val) {
                  Object.keys(this.options).forEach(val => {
                    if (this.value.indexOf(val) === -1) {
                      this.value.push(val)
                    }
                  })
                } else {
                  Object.keys(this.options).forEach(val => {
                    var idx = this.value.indexOf(val)
                    if (idx !== -1) {
                      this.value.splice(idx, 1)
                    }
                  })
                }
              }
            }
          })
        ]) || '',
        // 所有选项
        ...slots
      ])
    ])
  }
}
</script>

<style lang="less">
@import (reference) "../../styles/color.less";
@select-padding-left: 14px;
@select-height: 32px;

.km-select.km-dropdown {
  .km_select_all,
  .km_optgroup_name,
  .km-option {
    height: @select-height;
    line-height: @select-height;

    &:hover {
      background: @bg-light;
      color: @primary;
      cursor: default;
    }
    &[level="1"] {
      padding-left: @select-padding-left;
    }
    &[level="2"] {
      padding-left: @select-padding-left * 2;
    }
    &[level="3"] {
      padding-left: @select-padding-left * 3;
    }

    .km-checkbox {
      width: 100%;
    }
  }
}
</style>
