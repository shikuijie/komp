<template>
<div class="km-input" :class="{'km-disabled': disabled, 'km-focus': active}">
  <input type="text" v-model="text"
         :readonly="disabled" :placeholder="placeholder" 
         @blur.stop="onBlur" @focus.stop="onFocus">
</div>
</template>

<script>
import Bus from '../bus'

export default {
  props: {
    controlBus: Bus,
    value: String | Number,
    number: Boolean,
    disabled: Boolean,
    placeholder: String
  },
  data () {
    return {
      text: this.value,
      active: false
    }
  },
  watch: {
    value (val) {
      this.text = val
    }
  },
  created () {
    this.controlBus && this.controlBus.$on('control.getvalue', () => this.value)
  },
  destroyed () {
    this.controlBus && this.controlBus.$off('control.getvalue')
  },
  methods: {
    onBlur () {
      this.active = false
      this.text = this.text ? this.text.trim() : undefined
      if (this.number) {
        let n = +this.text
        this.text = (!n && n !== 0) ? this.text : n
      }
      this.$emit('input', this.text)
      this.$emit('change', this.text)
      this.controlBus && this.controlBus.$emit('control.check', this.text)
    },
    onFocus () {
      this.active = true
    }
  }
}
</script>
