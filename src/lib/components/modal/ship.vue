<template>
<div class="km-modal-ship"
    :class="{km_modal_nobg: nobg, km_modal_visible: visible}"
    @click.stop="nobg ? noop() : toggle(eid, edata)">
  <div class="km_modal_main" @click.stop="noop">
    <slot v-if="visible" :eid="eid" :edata="edata"></slot>
    <div class="km_modal_loading" v-show="loading">数据加载中，请稍候 ...</div>
    <i class="icon-close km_modal_close" @click.stop="toggle(eid, edata)"></i>
  </div>
</div>
</template>

<script>
import Bus from 'lib/bus'
import {hasListener} from 'lib/vnode'

export default {
  props: {
    bus: {
      type: Bus,
      required: true
    },
    nobg: Boolean
  },
  data () {
    return {
      visible: false,
      eid: null,
      edata: null
    }
  },
  computed: {
    loading () {
      var ctx = this.eid && this.bus.mCtxMap && this.bus.mCtxMap.get(this.eid)
      return ctx && (ctx.status === 'loading')
    }
  },
  methods: {
    noop () {},
    toggle (eid, edata) {
      if (this.visible) {
        return this.hide(eid, edata)
      } else {
        return this.show(eid, edata)
      }
    },
    show (eid, edata) {
      this.eid = eid
      this.edata = edata

      var ctx = this.bus.mCtxMap.get(eid)
      if (!ctx) {
        throw new Error('Modal Anchor EID corresponds to no Anchor Component')
      }
      if (ctx.status === null) {
        ctx.status = 'loading'
        new Promise(resolve => {
          if (this.mHasShowEvent) {
            this.$emit('show', {resolve, eid, edata})
          } else {
            resolve()
          }
        }).then(() => {
          ctx.status = 'done'
        })
      }

      this.visible = true
    },
    hide (eid, edata) {
      this.visible = false
      this.eid = null
      this.edata = null

      var ctx = this.bus.mCtxMap.get(eid)
      if (!ctx) {
        throw new Error('Modal Anchor EID corresponds to no Anchor Component')
      }

      if (ctx.status === 'loading') {
        return
      }
      ctx.status = null
      this.$emit('hide', {eid, edata})
    }
  },
  created () {
    this.mHasShowEvent = !!hasListener(this.$vnode, 'show')
    this.bus.$on('modal.toggle', this.toggle)
  },
  destroyed () {
    this.bus.$off('modal.toggle')
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";
@import (reference) "~style/size.less";
@modal-border-color: @border-light;
@zindex-modal: 3000;

.km-modal-ship {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background: rgba(0,0,0,.3);

  visibility: hidden;
  z-index: -1;
  opacity: 0;

  &.km_modal_visible {
    opacity: 1;
    visibility: visible;
    z-index: @zindex-modal;
  }

  &.km_modal_nobg {
    background: none;
    .km_modal_main {
      box-shadow: 0px 0px 20px @modal-border-color;
    }
  }

  .km_modal_main {
    position: absolute;
    left: 50%;
    top: 60px;
    transform: translateX(-50%);
    border-radius: @border-radius;
    background: #fff;

    .km_modal_loading {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: #fff;
    }

    .km_modal_close {
      position: absolute;
      right: 5px;
      top: 5px;
      font-size: 12px;
      cursor: pointer;
    }
  }
}
</style>
