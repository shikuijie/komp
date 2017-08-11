<template>
  <transition-group tag="ul" name="km-notice" class="km-notice">
    <li class="km_notice_item" v-for="(msg, i) in messages" :key="i">
      <slot :msg="msg">
        <div class="km_notice_content" :class="`km_notice_${msg.success ? 'success' : 'fail'}`">{{msg.content}}</div>
      </slot>
    </li>
  </transition-group>
</template>

<script>
import Bus from 'lib/bus'

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
    this.bus.$on('notice.success', item => {
      this.pushItem(item, true)
    })
    this.bus.$on('notice.fail', item => {
      this.pushItem(item, false)
    })
  },
  destroyed () {
    this.bus.$off('notice.success')
    this.bus.$off('notice.fail')
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";
@import (reference) "~style/size.less";

.km-notice-enter,
.km-notice-leave-active {
  opacity: 0;
  transform: translateX(50%);
}
.km-notice-enter-active,
.km-notice-leave-active {
  transition: all 1s;
}

.km-notice {
  position: fixed;
  bottom: 5px;
  right: 5px;

  .km_notice_item {
    margin-bottom: 5px;
    .km_notice_content {
      width: 200px;
      padding: 15px;
      border-radius: @border-radius;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #fff;

      &.km_notice_success {
        background: @primary;
      }
      &.km_notice_fail {
        background: @error;
      }
    }
  }
}
</style>
