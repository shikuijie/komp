<template>
  <div class="af-automatch"
       :style="{overflow: active ? '' : 'hidden'}">
    <input type="text" class="af-input-control" 
          ref="input"
          :placeholder="placeholder"
          :class="{'af-focus': active, 'af-disabled': disabled}"
          v-model="model"
          :readonly="isReadonly"
          @click.stop="active = true">
    <af-dropdown :visible="active" @hide="hide">
      <af-scroll :bus="bus" :speed="step">
        <slot></slot>
      </af-scroll>
    </af-dropdown>
  </div>
</template>
<script>
  import {hasVnodeListener, isUndefined, isString} from './util'
  import Bus from './bus'
  import afScroll from './scroll.vue'
  import afDropdown from './dropdown.vue'

  export default {
    components: {
      afDropdown,
      afScroll
    },
    name: 'form-automatch',
    props: {
      value: null,
      number: String,
      disabled: {
        type: Boolean,
        default: false
      },
      placeholder: String,
      readonly: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      step: {
        type: Number,
        default: 10
      },
      bus: Bus,
      __afControlBus: Bus
    },
    data () {
      return {
        active: false,
        model: this.value
      }
    },
    computed: {
      isReadonly () {
        return !isUndefined(this.readonly) || this.disabled
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
    watch: {
      value (val) {
        this.model = val
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
      },
      model (val) {
        if (this.__afTimeHandler) {
          window.clearTimeout(this.__afTimeHandler)
        }
        this.__afTimeHandler = window.setTimeout(() => {
          this.handler(val)
          this.__afTimeHandler = null
        }, 500)
      }
    },
    methods: {
      hide () {
        this.active = false
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      },
      handler (val) {
        if (!isUndefined(this.number)) {
          if (/^\d+$/.test(val)) {
            val = parseInt(val)
          } else if (/^\d+\.?\d*$/.test(val)) {
            val = parseFloat(val)
          }
        }
        if (isString(val) && !val) {
          val = undefined
        }

        this.$emit('input', val)
        if (this.__afChangeHandler) {
          this.$emit('change', val)
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

  .af-automatch {
    display: inline-block;
    position: relative;
    width: 100%;
    background: #fff;
    color: @dark;
    font-size: 14px;
    line-height: normal;

    .af-dropdown {
      margin-top: 1px;
      width: 100%;
      border: none;
    }

    .af-input-control {
      padding-right: 25px;
    }
  }
</style>