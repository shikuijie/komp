<template>
  <span class="af-checkbox" @click="toggle">
    <span class="_af_checkbox_icon" :class="{_af_checkbox_checked: checked && !disabled, _af_checkbox_disabled: disabled}">
      <i class="icon-selected"></i>
    </span><span class="_af_checkbox_label" :class="{_af_checkbox_disabled: disabled}" v-text="label"></span>
  </span>
</template>
<script>
  import {hasVnodeListener} from './util'
  import Bus from './bus'

  export default {
    name: 'form-checkbox',
    props: {
      label: String,
      value: null,
      trueValue: {
        type: null,
        default: true
      },
      falseValue: {
        type: null,
        default: false
      },
      disabled: Boolean,
      __afControlBus: Bus
    },
    mounted () {
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__af_getValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__af_getValueId)
      }
    },
    computed: {
      multiple () {
        return Array.isArray(this.value)
      },
      index () {
        return this.value.indexOf(this.trueValue)
      },
      checked () {
        if (this.multiple) {
          return this.index !== -1
        } else {
          return this.value === this.trueValue
        }
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    methods: {
      toggle () {
        if (this.disabled) {
          return
        }
        var nval = null
        // 计算勾选状态改变后，model将会变成的值
        if (this.multiple) {
          if (this.checked) {
            this.value.splice(this.index, 1)
          } else {
            this.value.push(this.trueValue)
          }
          nval = this.value
        } else {
          nval = this.checked ? this.falseValue : this.trueValue
        }

        // 真正的将改变后的值设置到value中
        if (this.multiple) {
          if (this.__afControlBus) {
            this.__afControlBus.$emit('__afCheck', nval)
          }
        } else {
          nval = this.checked ? this.falseValue : this.trueValue
          this.$emit('input', nval)
        }

        if (this.__afChangeHandler) {
          // 发送事件时将新值告诉用户
          this.$emit('change', nval)
        }

        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      }
    }
  }
</script>
<style lang="less">
  @import (reference) "../style/variable.less";
  
  .af-checkbox {
    display: inline-block;
    cursor: pointer;

    ._af_checkbox_label {
      margin-left: 4px;
      &._af_checkbox_disabled {
        color: @light;
      }
    }
    ._af_checkbox_icon {
      display: inline-block;
      position: relative;
      width: 14px;
      height: 14px;
      line-height: 14px;
      border: 1px solid #bfbfbf;
      border-radius: 2px;
      box-sizing: border-box;
      font-size: 12px;
      background: #fff;

      input {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
      }

      i {
        color: transparent;
        font-size: 13px;
      }

      &._af_checkbox_checked {
        border: none;
        i {
          color: @primary;
        }
      }
      &._af_checkbox_disabled {
        color: @light;
      }
    }
  }
</style>