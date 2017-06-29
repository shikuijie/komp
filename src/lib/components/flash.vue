<template>
  <transition-group tag="ul" name="km-flash" class="km-flash">
    <li class="km_flash_item" v-for="(msg, i) in messages" :key="i">
      <slot :msg="msg">
        <div class="km_flash_content" :class="`km_flash_${msg.success ? 'success' : 'fail'}`">{{msg.content}}</div>
      </slot>
    </li>
  </transition-group>
</template>

<script>
import Bus from '../bus'

export default {
  props: {
    bus: {
      type: Bus,
      required: true
    }
  },
  data () {
    return {
      messages: []
    }
  },
  methods: {
    pushItem (item, success) {
      var msg = {content: item, success}
      this.messages.push(msg)
      window.setTimeout(() => {
        this.messages.splice(this.messages.indexOf(msg), 1)
      }, 3000)
    }
  },
  created () {
    this.bus.$on('flash.success', item => {
      this.pushItem(item, true)
    })
    this.bus.$on('flash.fail', item => {
      this.pushItem(item, false)
    })
  },
  destroyed () {
    this.bus.$off('flash.success')
    this.bus.$off('flash.fail')
  }
}
</script>

<style lang="less">
@import (reference) "../styles/color.less";
@import (reference) "../styles/size.less";

.km-flash-enter,
.km-flash-leave-active {
  opacity: 0;
  transform: translateX(50%);
}
.km-flash-enter-active,
.km-flash-leave-active {
  transition: all 1s;
}

.km-flash {
  position: fixed;
  bottom: 5px;
  right: 5px;

  .km_flash_item {
    margin-bottom: 5px;
    .km_flash_content {
      width: 200px;
      padding: 15px;
      border-radius: @border-radius;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #fff;

      &.km_flash_success {
        background: @primary;
      }
      &.km_flash_fail {
        background: @error;
      }
    }
  }
}
</style>
