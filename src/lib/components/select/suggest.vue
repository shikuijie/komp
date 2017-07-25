<script>
import Vue from 'vue'
import Scroll from 'komp/scroll.vue'
import Dropdown from 'komp/dropdown.vue'
import Bus from 'lib/bus'
import {hasListener, getProps} from 'lib/vnode'

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
    value: null,
    initText: String,
    controlBus: Bus,
    disabled: Boolean,
    placeholder: String,
    clearable: Boolean,
    multiple: Boolean
  },
  data () {
    return {
      options: [],
      text: this.initText,
      inputing: false,
      loading: false,
      suggest: true
    }
  },
  computed: {
    optionsMap () {
      return this.options.reduce((res, opt) => {
        res.set(opt.value, opt.label)
        return res
      }, new Map())
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

        if (!this.value.length) {
          this.text = null
        }
      } else {
        this.text = null
        this.$emit('input', null)
      }
    },
    onInput ($event) {
      this.text = $event.target.value
      if (this.inputing) {
        return
      }

      var text = this.text
      if (this.mTimeHandle) {
        window.clearTimeout(this.mTimeHandle)
      }
      this.mTimeHandle = window.setTimeout(() => {
        this.mTimeHandle = null
        this.inputHandler(text)
      }, 800)
    },
    inputDone (text) {
      this.loading = false
      Vue.nextTick(() => {
        this.activeIndex = 0
        this.bus.$emit('scroll.reset', 'y', '0px')
      })

      if (this.mPrevText && this.mPrevText !== text) {
        this.inputHandler(this.mPrevText)
      }
    },
    inputHandler (text) {
      if (this.loading) {
        this.mPrevText = text
        return
      }

      this.loading = true
      new Promise(resolve => {
        if (this.mHasTextchangeEvent) {
          this.$emit('textchange', {resolve, text})
        } else {
          resolve()
        }
      }).then(
        () => this.inputDone(text),
        () => this.inputDone(text)
      )
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      let props = getProps(slot)
      props.topBus = this.bus
      if (this.multiple) {
        props.modelValue = this.value
      }
    })

    var data = {
      staticClass: 'km-suggest',
      class: {km_multiple: this.multiple, km_control: !!this.controlBus},
      props: {
        bus: this.bus,
        readonly: false,
        loading: !slots.length,
        placeholder: this.placeholder,
        disabled: this.disabled, clearable: this.clearable,
        label: (this.multiple && this.value.length) ? ' ' : this.optionsMap.get(this.value)
      },
      on: {clear: this.clear}
    }

    var editor = h('input', {
      slot: 'label', ref: 'input',
      attrs: {type: 'text', placeholder: this.placeholder},
      domProps: {value: this.text},
      on: {
        click: () => {
          if (this.text && !slots.length) {
            this.inputHandler(this.text)
          }
        },
        input: this.onInput,
        compositionstart: () => this.inputing = true,
        compositionend: () => this.inputing = false
      }
    })

    var labels = this.multiple ? h('ul', {
      staticClass: 'km_label_list', slot: 'label',
      on: {
        click: () => {
          this.$refs.input.focus()
          if (this.text && !slots.length) {
            this.inputHandler(this.text)
          }
        }
      }
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
    }, [ h('ul', slots) ]) : ''

    return h(Dropdown, data, [editor, labels, list])
  },
  created () {
    this.mHasTextchangeEvent = hasListener(this.$vnode, 'textchange')
    if (this.multiple && !Array.isArray(this.value)) {
      throw new Error('Model of multiple must be an array!')
    }

    this.bus.$on('option.add', (label, value) => {
      if (this.optionsMap[value] === label) {
        return
      }
      this.options.push({label, value})
    })
    this.bus.$on('option.delete', value => {
      if (this.multiple && this.value.indexOf(value) !== -1) {
        return
      }
      this.options = this.options.filter(opt => opt.value !== value)
    })

    // 将选中的 Option 组件的 value 值同步给父组件
    !this.multiple && this.bus.$on('option.change', (label, value) => {
      this.text = label
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
.km-suggest {
  .define-labels-style();

  &.km_multiple {
    .km_label_list {
      margin-left: @input-padding-right;
      li {
        background: white;
      }
    }
  }
}
</style>
