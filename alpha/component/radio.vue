<template>
  <div class="af-radio" @click="updateChecked(datum)">
    <span :class="iconClass"></span>
    <label :class="{'af-disabled': this.disabled}">
      <slot>{{label || datum}}</slot>
    </label>
  </div>
</template>
<script>
  import {hasVnodeListener} from './util'
  import Bus from './bus'

  export default {
    name: 'form-radio',
    props: {
      datum: {
        required: true
      },
      disabled: Boolean,
      value: null,
      label: String,
      __afControlBus: Bus
    },
    computed: {
      checked () {
        return this.value === this.datum
      },
      iconClass () {
        if (this.disabled) {
          return 'icon-exclaim'
        }
        return this.checked ? 'icon-radio-on' : 'icon-radio-off'
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
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
    methods: {
      updateChecked (nval) {
        if (this.disabled) {
          return
        }

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
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
  @import (reference) "~style/variable.less";

  .af-radio {
    display: inline-block;

    span,
    label {
      display: inline-block;
      height:30px;
      line-height: 30px;
      cursor: pointer;
      vertical-align: middle;
    }
    span {
      font-size: 16px;
      margin-right: 4px;
    }
    .icon-radio-on {
      color: @primary;
    }
    .icon-radio-off{
      color: @border-light;
    }

    .icon-exclaim,
    .af-disabled {
      color: @light;
      cursor: auto;
    }
    .icon-exclaim {
      font-size: 22px;
    }
  }
</style>