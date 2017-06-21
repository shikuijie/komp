<script>
import {getProps} from '../../vnode'
import Bus from '../../bus'
import Dropdown from '../dropdown.vue'
import Checkbox from '../checkbox.vue'
import Scroll from '../scroll.vue'

export default {
  components: {
    Dropdown,
    Checkbox,
    Scroll
  },
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    },
    controlBus: Bus,
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
      level: 0
    }
  },
  watch: {
    value (val, oval) {
      if (this.multiple) {
        if (val !== oval) {
          throw new Error('Model change is forbidden for multiple select component!')
        }
        this.bus.$emit('dropdown.change', val.map(v => this.options[v]), true)
      } else {
        if (val && !this.options[val]) {
          throw new Error('Model value of Select must be among values of Options')
        }
        this.bus.$emit('dropdown.change', this.options[val])
      }
    }
  },
  created () {
    if (this.multiple && !Array.isArray(this.value)) {
      throw new Error('Model of multiple select must be an array!')
    }

    // 将选中的 Option 组件的 value 值同步给父组件
    if (!this.multiple) {
      this.bus.$on('select.change', val => {
        this.$emit('input', val)
        this.$emit('change', val)
        this.controlBus && this.controlBus.$emit('control.check', val)
      })
    }

    // 下拉框发送 clear 事件来清空选中的数据
    if (this.multiple) {
      this.bus.$on('dropdown.clear', label => {
        if (label) {
          let val = Object.keys(this.options).find(v => this.options[v] === label)
          let idx = this.value.indexOf(val)
          if (idx !== -1) {
            this.value.splice(idx, 1)
          }
        } else {
          this.value.splice(0, this.value.length)
        }
      })
    }

    if (this.controlBus) {
      this.controlBus.$on('control.getvalue', () => this.value)
    }
  },
  mounted () {
    if (this.multiple) {
      this.bus.$emit('dropdown.change', this.value.map(v => this.options[v]), true)
    } else {
      this.bus.$emit('dropdown.change', this.value ? this.options[this.value] : null)
    }
  },
  destroyed () {
    if (!this.multiple) {
      this.bus.$off('select.change')
    } else {
      this.bus.$off('dropdown.clear')
    }

    if (this.controlBus) {
      this.controlBus.$off('control.getvalue')
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      let props = getProps(slot)
      // 给子组件添加 props
      props.selectOptions = this.options
      props.selectValue = this.value
      props.selectExpand = this.expandable
      props.multiple = this.multiple
      props.level = this.level + 1
      props.selectBus = this.bus
    })

    return h(Dropdown, {
      staticClass: 'km-select',
      attrs: {
        multiple: this.multiple
      },
      props: {
        bus: this.bus,
        readonly: true,
        disabled: this.disabled,
        clearable: this.clearable,
        eventToClear: this.multiple,
        placeholder: this.placeholder,
        loading: !slots.length
      }
    }, [
      slots.length ? h(Scroll, {
        props: {
          hidden: true,
          bus: this.bus
        }
      }, [
        h('ul', slots)
      ]) : ''
    ])
  }
}
</script>

<style lang="less">
@import (reference) "../../styles/color.less";
@select-padding-left: 14px;
@select-height: 32px;

.km-select.km-dropdown {
  .km_optgroup_name,
  .km-option {
    height: @select-height;
    line-height: @select-height;

    > * {
      display: inline-block;
    }

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
  }
}
</style>
