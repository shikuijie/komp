<script>
import Bus from 'lib/bus'
import {getProps} from 'lib/vnode'
import Scroll from 'komp/scroll.vue'
import Dropdown from 'komp/dropdown.vue'

export default {
  components: {
    Dropdown,
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
    multiple: Boolean
  },
  computed: {
    optionsMap () {
      return this.options.reduce((res, opt) => {
        res.set(opt.value, opt.label)
        return res
      }, new Map())
    }
  },
  data () {
    return {
      options: []
    }
  },
  methods: {
    clear (val) {
      if (this.multiple) {
        if (val) {
          this.value.splice(this.value.indexOf(val), 1)
        } else {
          this.value.splice(0, this.value.length)
        }
      } else {
        this.$emit('input', null)
      }
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      let props = getProps(slot)
      props.topBus = this.bus

      props.multiple = this.multiple
      if (this.multiple) {
        props.modelValue = this.value
      }
    })

    var data = {
      staticClass: 'km-select',
      class: {
        km_multiple: this.multiple,
        km_control: !!this.controlBus
      },
      props: {
        bus: this.bus,
        readonly: true,
        loading: !slots.length,
        placeholder: this.placeholder,
        disabled: this.disabled, clearable: this.clearable,
        label: (this.multiple && this.value.length) ? ' ' : this.optionsMap.get(this.value)
      },
      on: {clear: this.clear}
    }

    var labels = this.multiple ? h('ul', {
      staticClass: 'km_label_list', slot: 'label'
    }, this.value.map(val => h('li', [
      this.optionsMap.get(val),
      h('i', {
        staticClass: 'km-pointer icon-close-small',
        on: {
          click: $event => {
            $event.stopPropagation()
            this.clear(val)
          }
        }
      })
    ]))) : ''

    var list = slots.length ? h(Scroll, {
      props: {hidden: true, bus: this.bus}
    }, [
      h('ul', slots)
    ]) : ''

    return h(Dropdown, data, [labels, list])
  },
  created () {
    if (this.multiple && !Array.isArray(this.value)) {
      throw new Error('Model of multiple must be an array!')
    }

    this.bus.$on('option.add', (label, value) => {
      this.options.push({label, value})
    })
    this.bus.$on('option.delete', value => {
      this.options = this.options.filter(opt => opt.value !== value)
    })

    // 将选中的 Option 组件的 value 值同步给父组件
    !this.multiple && this.bus.$on('option.change', (label, value) => {
      this.$emit('input', value)
      this.$emit('change', value)

      this.bus.$emit('dropdown.hide')
      this.controlBus && this.controlBus.$emit('control.check', value)
    })

    this.controlBus && this.controlBus.$on('control.getvalue', () => this.value)
  },
  destroyed () {
    this.bus.$off('option.add')
    this.bus.$off('option.delete')
    !this.multiple && this.bus.$off('option.change')

    this.controlBus && this.controlBus.$off('control.getvalue')
  }
}
</script>

<style lang="less">
@import (reference) "./style.less";
.km-select {
  .define-labels-style();
}
</style>