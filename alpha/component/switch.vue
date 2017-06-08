<template>
<span 
  class="af-switch" 
  :class="{_af_switch_on: checked}" 
  @click.stop="toggle"></span>
</template>
<script>
  import {hasVnodeListener} from './util'
  export default {
    props: {
      value: null,
      disabled: {
        type: Boolean,
        default: false
      },
      trueValue: {
        type: null,
        default: true
      },
      falseValue: {
        type: null,
        default: false
      }
    },
    computed: {
      checked () {
        return this.index >= 0
      },
      index () {
        return this.value.indexOf(this.trueValue)
      }
    },
    mounted () {
      this.__afHasChange = hasVnodeListener(this.$vnode, 'change')
    },
    methods: {
      toggle () {
        if (this.disabled) {
          return
        }

        let nval = this.value.slice()
        let nvalue = this.checked ? (this.falseValue || false) : (this.trueValue || true)
        if (this.index >= 0) {
          nval.splice(this.index, 1)
        } else {
          nval.push(nvalue)
        }

        if (this.__afHasChange) {
          this.$emit('change', nval)
        }
        this.$emit('input', nval)
      }
    }
  }
</script>
<style lang="less">
  .af-switch {
    display: inline-block;
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background-color: #ccc;
    cursor: pointer;
    &:before {
      content: '';
      display: block;
      position: absolute;
      left: 1px;
      top: 2px;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background-color:#fff;
    }
    &:after {
      content:'';
      display: block;
      position: absolute;
      border-radius: 12px;
      width: 100%;
      height: 100%;
      background-color: transparent;
    }
  }
  .af-switch._af_switch_on {
    &:before {
      left: auto;
      right: 1px;
      z-index: 2;
    }
    &:after {
      background-color: #00b38a;
      z-index: 1;
    }
  }
</style>