<template>
  <div class="af-textarea" @click="active = true">
    <textarea :rows="rows" :placeholder="placeholder"
              ref="input"
              :class="{'af-focus': active, 'af-disabled': disabled}"
              :value="value"
              :readonly="disabled"
              @blur.stop="blur"
              @input.stop="input"
              @focus.stop="active = true"></textarea>
  </div>
</template>
<script>
  import {hasVnodeListener, isUndefined} from './util'
  import {Bus} from './bus'

  export default {
    name: 'form-textarea',
    props: {
      value: String,
      placeholder: String,
      disabled: {
        type: Boolean,
        default: false
      },
      realtime: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      __afControlBus: Bus,
      rows: {
        type: Number | String,
        default: 5
      }
    },
    data () {
      return {
        active: false
      }
    },
    mounted () {
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')
      this.__afEnterHandler = hasVnodeListener(this.$vnode, 'enter')

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
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      }
    },
    methods: {
      enter ($event) {
        this.changeValue($event.target.value, this.__afEnterHandler)
      },
      blur ($event) {
        this.active = false
        this.changeValue($event.target.value)
      },
      input ($event) {
        if (!isUndefined(this.realtime)) {
          this.changeValue($event.target.value)
        }
      },
      changeValue (val, enter) {
        this.$emit('input', val)
        if (this.__afChangeHandler) {
          this.$emit('change', val)
        }
        if (enter) {
          this.$emit('enter', val)
        }

        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      }
    }
  }
</script>
<style lang="less">
  @import (reference) '../style/variable.less';

  .af-textarea {
    textarea {
      display: block;
      width: 100%;

      background-color: #fff; 
      background-image: none;
      border: 1px solid @border-light;
      border-radius: 3px;
      box-sizing: border-box;
      outline: none;

      &.af-focus {
        border-color: @primary-focus;
      }
      &.af-disabled {
        border-color: @border-light;
        background: @border-lighter;
      }
    }
  }
</style>