<template>
  <div class="af-modal"
       :class="{_af_modal_visible: visible}"
       @click.self="maskClose">
    <div class="_af_modal_main">
      <div class="_af_icon icon-close" 
           v-show="times" 
           @click.stop="iconClose"></div>
      <slot name="header" :context="context"></slot>
      <slot name="body" :context="context"></slot>
      <slot name="footer" :context="context"></slot>
    </div>
  </div>
</template>
<script>
import {hasVnodeListener} from './util'
import Bus from './bus'

export default {
  props: {
    // 默认是true,可以关闭
    mask: {
      type: Boolean,
      default: true
    },
    // 叉叉按钮
    times: {
      type: Boolean,
      default: true
    },

    bus: {
      type: Bus,
      required: true
    },
    init: {
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      visible: false,
      context: this.init
    }
  },
  mounted () {
    this.__afHasHide = hasVnodeListener(this.$vnode, 'hide')
    this.__afHasShow = hasVnodeListener(this.$vnode, 'show')

    this.bus.__afInit = this.init
    this.__afBusShowId = this.bus.$on('show', context => {
      this.context = context
      this.visible = true

      if (this.__afHasShow) {
        this.$emit('show', context)
      }
    })

    this.__afBusHideId = this.bus.$on('hide', () => {
      this.hide(this.context)
    })
  },
  destroyed () {
    this.bus.$off('show', this.__afBusShowId)
    this.bus.$off('hide', this.__afBusHideId)
  },
  methods: {
    hide (context) {
      this.visible = false
      if (this.__afHasHide) {
        this.$emit('hide', context)
      }
      this.context = this.init
    },
    // 点击icon
    iconClose () {
      this.hide(this.context)
    },
    // 点击mask
    maskClose () {
      if (!this.mask) {
        return
      }
      this.hide(this.context)
    }
  },
  Directive: {
    unbind (el, binding, vnode) {
      var bus = getDirectiveDate(binding.value)[0]
      el.__afContext = bus.__afInit
      el.removeEventListener('click', el.__afListener)
    },
    componentUpdated (el, binding, vnode) {
      var context = getDirectiveDate(binding.value)[1]
      el.__afContext = context
    },
    bind (el, binding, vnode) {
      var [bus, context] = getDirectiveDate(binding.value)
      el.__afContext = context

      function listener ($event) {
        $event.stopPropagation()
        if (binding.modifiers.hide) {
          bus.$emit('hide')
        } else {
          bus.$emit('show', el.__afContext)
        }
      }

      el.addEventListener('click', listener)
      el.__afListener = listener
    }
  }
}

function getDirectiveDate (value) {
  var bus = null
  var context = null
  if (value instanceof Bus) {
    bus = value
    context = {}
  } else {
    bus = value.bus
    context = value.context || {}
  }
  return [bus, context]
}
</script>
<style lang="less">
  @import "../style/variable.less";
  .af-modal {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: @modal-mask;
    overflow-x: hidden;
    overflow-y: auto;
    visibility: hidden;
    opacity: 0;

    &._af_modal_visible {
      visibility: visible;
      opacity: 1;
      z-index: @zindex-modal;
    }

    ._af_modal_main {
      position: absolute;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      padding: 58px 50px;
      border-radius: 2px;
      background-color: #fff;
    }

    ._af_icon {
      width:17px;
      height:17px;
      position:absolute;
      top:23px;
      right:22px;
      cursor: pointer;
      background-repeat: no-repeat;
    }
  }
</style>