<template>
<div class="km-tip-ship" @click.stop="() => {}"
    :class="{km_tip_visible: visible}" :style="tipStyle">
  <div class="km_tip_triangle" :style="triangleStyle" :class="`km_tip_${position}`">
    <div class="km_tip_square"></div>
  </div>
  <slot v-if="eid" :eid="eid" :edata="edata"></slot>
  <div class="km_tip_loading" v-show="loading">数据加载中，请稍后 ...</div>
</div>
</template>

<script>
import Vue from 'vue'
import Bus from 'lib/bus'
import {isServer} from 'lib/util'
import {hasListener} from 'lib/vnode'

const Tip = {bus: null, eid: null, edata: null}
if (!isServer()) {
  document.documentElement.addEventListener('click', () => {
    Tip.bus && Tip.bus.$emit('tip.hide', Tip.eid, Tip.edata)
  })
}

export default {
  props: {
    bus: {
      type: Bus,
      required: true
    }
  },
  data () {
    return {
      eid: null,
      edata: null,
      visible: false,
      position: 'left',
      tipStyle: {
        left: 0,
        top: 0,
        bottom: 'auto',
        right: 'auto'
      },
      triangleStyle: {
        left: 0,
        top: 0,
        bottom: 'auto',
        right: 'auto'
      }
    }
  },
  computed: {
    loading () {
      var ctx = this.eid && this.bus.mCtxMap && this.bus.mCtxMap.get(this.eid)
      return ctx && ctx.loading
    }
  },
  methods: {
    show ({$el, position}) {
      var vertical = position === 'left' || position === 'right'
      var width = this.$el.offsetWidth
      var height = this.$el.offsetHeight
      var parent = this.$el.offsetParent.getBoundingClientRect()
      var tip = this.tipStyle
      var tri = this.triangleStyle
      var ww = window.innerWidth || document.body.clientWidth
      var wh = window.innerHeight || document.body.clientHeight

      var rect = $el.getBoundingClientRect()
      if (vertical) {
        if (position === 'right' || rect.left - 8 - width < 0) {
          // 显示在右方
          tip.left = rect.right + 8 - parent.left + 'px'
          tri.left = -7 + 'px'
          tri.right = 'auto'
          this.position = 'right'
        } else {
          // 显示在左方
          tip.left = rect.left - 8 - width - parent.left + 'px'
          tri.right = -7 + 'px'
          tri.left = 'auto'
          this.position = 'left'
        }

        let center = (rect.top + rect.bottom) / 2
        if (center - height / 2 >= 0 && center + height / 2 <= wh) {
          // 居中
          tip.top = center - height / 2 - parent.top + 'px'
          tri.top = height / 2 - 7 + 'px'
          tri.bottom = 'auto'
        } else if (center - height / 2 < 0) {
          // 下移
          tip.top = -parent.top + 'px'
          tri.top = center - 7 + 'px'
          tri.bottom = 'auto'
        } else {
          // 上移
          tip.top = wh - height - parent.top + 'px'
          tri.bottom = wh - center - 7 + 'px'
          tri.top = 'auto'
        }
      } else {
        if (position === 'bottom' || rect.top - 8 - height < 0) {
          // 显示在下方
          tip.top = rect.bottom + 8 - parent.top + 'px'
          tri.top = -7 + 'px'
          tri.bottom = 'auto'
          this.position = 'bottom'
        } else {
          // 显示在上方
          tip.top = rect.top - 8 - height - parent.top + 'px'
          tri.bottom = -7 + 'px'
          tri.top = 'auto'
          this.position = 'top'
        }

        let center = (rect.left + rect.right) / 2
        if (center - width / 2 >= 0 && center + width / 2 <= ww) {
          // 居中
          tip.left = center - width / 2 - parent.left + 'px'
          tri.left = width / 2 - 7 + 'px'
          tri.right = 'auto'
        } else if (center - width / 2 < 0) {
          // 右移
          tip.left = -parent.left + 'px'
          tri.left = center - 7 + 'px'
          tri.right = 'auto'
        } else {
          // 左移
          tip.left = ww - width - parent.left + 'px'
          tri.right = ww - center - 7 + 'px'
          tri.left = 'auto'
        }
      }

      this.visible = true
    }
  },
  created () {
    this.mHasShowEvent = !!hasListener(this.$vnode, 'show')
    this.bus.$on('tip.show', (eid, edata) => {
      if (Tip.bus === this.bus && Tip.eid === eid) {
        return // 当前显示的就是需要显示的 Anchor
      }

      // 关闭当前显示的 Anchor
      Tip.bus && Tip.bus.$emit('tip.hide', Tip.eid, Tip.edata)
      var ctx = this.bus.mCtxMap.get(eid)
      if (!ctx) {
        throw new Error('Tip Anchor EID corresponds to no Anchor Component')
      }
      if (ctx.trigger === 'click') {
        Tip.bus = this.bus
        Tip.eid = eid
        Tip.edata = edata
      }

      // 显示前的准备工作
      this.eid = eid
      this.edata = edata

      if (ctx.loading === null) {
        ctx.loading = true
        new Promise(resolve => {
          if (this.mHasShowEvent) {
            this.$emit('show', {resolve, eid, edata})
          } else {
            resolve()
          }
        }).then(() => {
          ctx.loading = false
        })
      }
      Vue.nextTick(() => this.show(ctx))
    })

    this.bus.$on('tip.hide', (eid, edata) => {
      var ctx = this.bus.mCtxMap.get(eid)
      if (!ctx) {
        throw new Error('Tip Anchor EID corresponds to no Anchor Component')
      }
      if (ctx.trigger === 'click') {
        Tip.bus = null
        Tip.eid = null
        Tip.edata = null
      }

      this.visible = false
      this.eid = null
      this.edata = null

      // 如果当前 Anchor 正在加载数据，则不发送 hide 事件
      if (ctx.loading === false) {
        ctx.loading = null
        this.$emit('hide', {eid, edata})
      }
    })

    this.bus.$on('tip.toggle', (eid, edata) => {
      if (this.visible && this.eid === eid) {
        this.bus.$emit('tip.hide', eid, edata)
      } else {
        this.bus.$emit('tip.show', eid, edata)
      }
    })
  },
  destroyed () {
    this.bus.$off('tip.show')
    this.bus.$off('tip.hide')
    this.bus.$off('tip.toggle')
    this.bus.mCtxMap = null
  }
}
</script>

<style lang="less">
@import (reference) '~style/color.less';

@zindex-tip: 3000;
.km-tip-ship {
  position: absolute;
  border: 1px solid @border-light;
  border-radius: 2px;
  background: white;
  box-shadow: 0 2px 3px rgba(0,0,0,.08);

  visibility: hidden;
  z-index: -1;
  opacity: 0;

  &.km_tip_visible {
    opacity: 1;
    visibility: visible;
    z-index: @zindex-tip;
  }

  .km_tip_triangle {
    position: absolute;
    left: 0;
    top: 0;
    width: 14.2px;
    height: 7.1px;
    overflow: hidden;

    &.km_tip_left,
    &.km_tip_right {
      width: 7.1px;
      height: 14.2px;
    }

    .km_tip_square {
      position: relative;
      left: 2px;
      top: 2px;
      width: 10px;
      height: 10px;
      border: 1px solid @border-light;
      background: white;
      transform: rotateZ(45deg);
    }
    &.km_tip_top .km_tip_square {
      left: 2px;
      top: -5px;
    }
    &.km_tip_left .km_tip_square {
      left: -5px;
      top: 2px;
    }
    &.km_tip_right .km_tip_square {
      left: 2px;
      top: 2px;
    }
  }

  .km_tip_loading {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: #fff;
  }
}
</style>
