<template>
<div class="af-notice">
  <transition name="fade" v-for="(notice, index) in context">
    <div class="af-notice-item" 
          :class="`_af_${notice.type}`"
          :bus="bus">
      {{notice.content}}
    </div>
  </transition>
</div>
</template>
<script>
import Bus from 'ui/bus'
export default {
  props: {
    bus: {
      type: Bus,
      required: true
    }
  },
  data () {
    return {
      context: []
    }
  },
  mounted () {
    this.__afBusSuccessId = this.bus.$on('success', text => {
      this.update('success', text)
    })
    this.__afBusFailId = this.bus.$on('fail', text => {
      this.update('fail', text)
    })
  },
  methods: {
    update (type, text) {
      let notice = {timer: null, content: null, show: null, type: null}
      notice.content = text
      notice.type = type
      notice.show = this.show
      this.context.unshift(notice)
      this.show(notice)
    },
    show (ctx) {
      ctx.timer = window.setTimeout(() => {
        this.context.pop()
      }, ctx.duration || 3000)
    }
  },
  destroyed () {
    this.bus.$off('success', this.__afBusSuccessId)
    this.bus.$off('fail', this.__afBusFailId)
  }
}
</script>
<style lang="less">
@import (reference) "~style/variable.less";
.af-notice {
  position: fixed;
  top: 70px;
  right: 10px;
  width: 200px;
  border-radius: 4px;
  z-index: @zindex-notice;

  .af-notice-item {
    margin-top: 5px;
    padding: 12px 15px;
    border-radius: 4px;

    &._af_success {
      background-color: @primary;
      color: #fff;
    }
    &._af_fail {
      background-color: @warn;
      color: #fff;
    }
  }
  .fade-enter-active, .fade-leave-active {
    transition: all .6s ease;
  }
  .fade-enter, .fade-leave-active {
    opacity: 0;
  }
}
</style>

