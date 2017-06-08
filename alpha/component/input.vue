<template>
  <div class="af-input" @click="active = true">
    <input type="text" class="af-input-control" 
          ref="input"
          :placeholder="placeholder"
          :class="{'af-focus': active, 'af-disabled': disabled}"
          :value="value"
          :readonly="readonly === '' || disabled"
          @keyup.enter.stop="enter"
          @input.stop="input"
          @blur.stop="blur"
          @focus.stop="active = true">
  </div>
</template>
<script>
  import {hasVnodeListener, isUndefined, isString} from './util'
  import Bus from './bus'

  export default {
    name: 'form-input',
    props: {
      value: null,
      number: String,
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
      placeholder: String,
      readonly: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      __afControlBus: Bus
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
        this.changeVal($event.target.value, this.__afEnterHandler)
      },
      blur ($event) {
        this.active = false
        this.changeVal($event.target.value)
      },
      input ($event) {
        if (!isUndefined(this.realtime)) {
          this.changeVal($event.target.value)
        }
      },
      changeVal (val, enter) {
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