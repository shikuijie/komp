<template>
<div class="km-input km_input" :class="{'km-disabled': disabled, 'km-focus': active, km_control: !!controlBus}">
  <input type="text" v-model="text"
         :readonly="disabled" :placeholder="placeholder" 
         @blur.stop="onBlur" @focus.stop="active = true">
</div>
</template>

<script>
import Bus from 'lib/bus'

export default {
  props: {
    controlBus: Bus,
    value: String | Number,
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
      this.text = this.text ? this.text.trim() : null

      this.$emit('input', this.text)
      this.$emit('change', this.text)
      this.controlBus && this.controlBus.$emit('control.check', this.text)
    }
  }
}
</script>

<style lang="less">
.km-input.km_input {
  height: 38px;
  line-height: 38px;
}
</style>
