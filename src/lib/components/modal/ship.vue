<template>
<div class="km-modal" v-show="visible">
  <div class="km_modal_bg"></div>
  <slot :eid="eid" :edata="edata"></slot>
</div>
</template>

<script>
import Bus from '../../bus'

export default {
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    }
  },
  data () {
    return {
      visible: false
    }
  },
  created () {
    this.bus.$on('modal.show', () => {
      this.visible = true
    })
    this.bus.$on('modal.hide', () => {
      this.visible = false
    })
    this.bus.$on('modal.toggle', () => {
      this.bus.$emit(this.visible ? 'modal.hide' : 'modal.show')
    })
  },
  destroyed () {
    this.bus.$off('modal.show')
    this.bus.$off('modal.hide')
    this.bus.$off('modal.toggle')
  }
}
</script>

<style lang="less">
.km-modal {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);

  .km_modal_bg {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
