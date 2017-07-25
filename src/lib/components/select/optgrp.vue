<script>
import Vue from 'vue'
import Bus from 'lib/bus'
import {getProps} from 'lib/vnode'
import Checkbox from 'komp/checkbox.vue'

export default {
  components: {
    Checkbox
  },
  props: {
    label: String,
    topBus: Bus,
    modelValue: null,
    multiple: Boolean
  },
  data () {
    return {
      bus: new Bus(),
      options: []
    }
  },
  computed: {
    checked () {
      return this.options.every(val => this.modelValue.indexOf(val) !== -1)
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      let props = getProps(slot)
      props.groupBus = this.bus
      props.modelValue = this.modelValue
      props.topBus = this.topBus
      props.multiple = this.multiple
    })

    return h('ul', {
      staticClass: 'km-optgrp',
      class: {
        km_optgrp_multiple: this.multiple
      }
    }, [
      // 组名
      h('li', {
        on: this.multiple ? {
          click: event => {
            event.stopPropagation()
            if (this.checked) {
              this.options.forEach(val => {
                this.modelValue.splice(this.modelValue.indexOf(val), 1)
              })
            } else {
              this.options.forEach(val => {
                this.modelValue.indexOf(val) === -1 && this.modelValue.push(val)
              })
            }
          }
        } : {}
      }, this.$slots.label || [
        h('div', {
          staticClass: 'km_optgrp_label'
        }, [
          this.multiple ? h(Checkbox, {
            props: {
              nostop: true,
              value: this.checked
            }
          }) : '',
          this.label
        ])
      ]),
      ...slots
    ])
  },
  created () {
    this.bus.$on('option.add', value => this.options.push(value))
    this.bus.$on('option.delete', value => this.options.splice(this.options.indexOf(value), 1))
  },
  destroyed () {
    this.bus.$off('option.add')
    this.bus.$off('option.delete')
  }
}
</script>

<style lang="less">
@import (reference) "./style.less";

.km-optgrp {
  display: inline-block;
  width: 100%;

  .km_optgrp_label {
    .define-option-style();
  }
  &:not(.km_optgrp_multiple) .km_optgrp_label:hover {
    background: transparent;
    color: inherit;
  }
}

.km-optgrp .km-option .km_option_label {
  padding-left: @padding-left * 2;
}
</style>