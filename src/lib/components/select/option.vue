<template>
<li class="km-option" @click.stop="select">
  <slot>
    <div class="km_option_label">
      <km-checkbox v-if="multiple" :nostop="true" :value="modelValue.indexOf(value) !== -1"></km-checkbox>{{label}}
    </div>
  </slot>
</li>
</template>

<script>
import Bus from 'lib/bus'
export default {
  name: 'km-option',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    topBus: Bus,
    groupBus: Bus,
    modelValue: null,
    multiple: Boolean
  },
  methods: {
    select () {
      if (this.multiple) {
        let idx = this.modelValue.indexOf(this.value)
        if (idx === -1) {
          this.modelValue.push(this.value)
        } else {
          this.modelValue.splice(idx, 1)
        }
      } else {
        this.topBus.$emit('option.change', this.label, this.value)
      }
    }
  },
  created () {
    this.topBus.$emit('option.add', this.label, this.value)
    this.groupBus && this.groupBus.$emit('option.add', this.value)
  },
  destroyed () {
    this.topBus.$emit('option.delete', this.value)
    this.groupBus && this.groupBus.$emit('option.delete', this.value)
  }
}
</script>

<style lang="less">
@import (reference) "./style.less";

.km-option {
  display: inline-block;
  width: 100%;
  .km_option_label {
    .define-option-style();
  }
}
</style>