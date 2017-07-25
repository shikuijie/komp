<template>
<span class="km-checkbox km-pointer" @click="toggle">
  <i :class="{'icon-check-on': isChecked, 'icon-check-off': !isChecked}">
  </i><span>{{label}}</span>
</span>
</template>

<script>
import Bus from 'lib/bus'

export default {
  props: {
    controlBus: Bus,
    value: null,
    label: String,
    disabled: Boolean,
    nostop: Boolean,
    onvalue: {
      default: true
    },
    offvalue: null
  },
  computed: {
    isChecked () {
      return this.isGroup ? this.value.indexOf(this.onvalue) !== -1 : this.onvalue === this.value
    },
    isGroup () {
      return Array.isArray(this.value)
    }
  },
  methods: {
    toggle ($event) {
      if (!this.nostop) {
        return $event.stopPropagation()
      }
      var nval = null
      if (this.isGroup) {
        if (this.isChecked) {
          this.value.splice(this.value.indexOf(this.onvalue), 1)
        } else {
          this.value.push(this.onvalue)
        }
        nval = this.value
      } else {
        nval = !this.isChecked ? this.onvalue : this.offvalue
        this.$emit('input', nval)
      }

      this.$emit('change', nval)
      this.controlBus && this.controlBus.$emit('control.check', nval)
    }
  },
  created () {
    this.controlBus && this.controlBus.$on('control.getvalue', () => this.value)
  },
  destroyed () {
    this.controlBus && this.controlBus.$off('control.getvalue')
  },
}
</script>

<style lang="less">
@import (reference) "~style/color.less";
@checkbox-uncheck-color: @light;
@checkbox-label-margin: 5px;

.km-checkbox {
  display: inline-block;

  i {
    margin-right: @checkbox-label-margin;

    &.icon-check-on {
      color: @primary;
    }
    &.icon-check-off {
      color: @checkbox-uncheck-color;
    }
  }
}
</style>
