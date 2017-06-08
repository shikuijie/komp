<template>
  <div class="af-scroll">
    <div class="_af_scroll_body" ref="body" @wheel="wheel" :style="{top: -this.offset + 'px'}">
      <slot></slot>
    </div>
    <div class="_af_scroll_column" :class="{_af_scroll_invisible: bar === undefined}" v-if="!noscroll">
      <div class="_af_scroll_block" ref="block" @mousedown.stop="startDrag" :style="{height: blockHeight + 'px', top: (offset / unit) + 'px'}"></div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import Bus from './bus'
  import {isUndefined} from 'ui/util'

  var CURRENT = null
  document.documentElement.addEventListener('mousemove', event => {
    if (!CURRENT) {
      return
    }
    var {ctx, pos} = CURRENT
    var delta = event.clientY - pos
    var offset = ctx.offset + ctx.unit * delta

    if (offset > ctx.__afBodyHeight - ctx.__afElHeight) {
      offset = ctx.__afBodyHeight - ctx.__afElHeight
    } else if (offset < 0) {
      offset = 0
    }
    ctx.offset = offset

    CURRENT.pos = event.clientY
  })
  document.body.addEventListener('mouseup', event => {
    if (!CURRENT) {
      return
    }
    document.documentElement.style.userSelect = CURRENT.us
    CURRENT = null
  })

  export default {
    props: {
      bus: Bus,
      init: String | Number,
      bar: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      speed: { // 滚动速度
        type: Number,
        default: 5
      }
    },
    data () {
      return {
        offset: 0,
        unit: 1,
        noscroll: false,
        blockHeight: 20
      }
    },
    mounted () {
      if (this.bus) {
        this.__afResetId = this.bus.$on('reset', this.reset)
        this.__afScrollId = this.bus.$on('scroll', this.scrollBy)
      }
      Vue.nextTick(this.reset)
    },
    destroyed () {
      if (this.bus) {
        this.bus.$off('reset', this.__afResetId)
        this.bus.$off('scroll', this.__afScrollId)
      }
    },
    methods: {
      startDrag ($event) {
        if (isUndefined(this.bar)) {
          return
        }
        var us = document.documentElement.style.userSelect
        CURRENT = {pos: $event.clientY, ctx: this, us}
        document.documentElement.style.userSelect = 'none'
      },
      reset () {
        this.__afElHeight = this.$el.offsetHeight
        this.__afBodyHeight = this.$refs.body.offsetHeight

        if (this.__afBodyHeight <= this.__afElHeight) {
          this.noscroll = true
        } else {
          this.noscroll = false
          if (!isUndefined(this.bar)) {
            this.blockHeight = this.__afElHeight * this.__afElHeight / this.__afBodyHeight
          }
          // 滚动条每滚动一个像素，滚动体会滚动unit个像素
          this.unit = (this.__afBodyHeight - this.__afElHeight) / (this.__afElHeight - this.blockHeight)
        }

        this.offset = this.normalize(this.init)
      },
      normalize (offset) {
        if (!offset) {
          offset = 0
        } else if (offset.indexOf('%') !== -1) {
          offset = this.__afElHeight * (parseFloat(offset) || 0) / 100
        } else if (offset.indexOf('px') !== -1) {
          offset = parseFloat(offset) || 0
        } else {
          offset = 0
        }

        return offset
      },
      scrollBy (progress) {
        if (this.noscroll) {
          this.reset()
        }
        if (this.noscroll || this.__afScrolling) {
          return
        }
        this.__afScrolling = true

        var offset = this.normalize(progress)
        if (this.offset + offset >= this.__afBodyHeight - this.__afElHeight) {
          offset = this.__afBodyHeight - this.__afElHeight - this.offset
        } else if (this.offset + offset <= 0) {
          offset = -this.offset
        }

        // .5s内走完offset个像素，每次走this.speed个像素
        // 需要分几次走完
        var speed = offset < 0 ? -this.speed : this.speed
        var number = Math.floor(offset / speed)
        var lastSpeed = offset - number * speed
        // 每次走多久
        var time = 500 / number

        var self = this
        window.setTimeout(function step () {
          if (number <= 0) {
            self.offset += lastSpeed
            self.__afScrolling = false
          } else {
            self.offset += speed
            window.setTimeout(step, time)
          }
          number--
        })
      },
      wheel ($event) {
        if (this.noscroll) {
          this.reset()
        }
        if (!this.noscroll) {
          $event.preventDefault()
          $event.stopPropagation()
        } else {
          return
        }

        var offset = this.offset
        if ($event.deltaY > 0) {
          if (offset + this.speed >= this.__afBodyHeight - this.__afElHeight) {
            offset = this.__afBodyHeight - this.__afElHeight
          } else {
            offset += this.speed
          }
        } else {
          if (offset - this.speed <= 0) {
            offset = 0
          } else {
            offset -= this.speed
          }
        }

        this.offset = offset
      }
    }
  }
</script>
<style lang="less">
  @import (reference) '../style/variable.less';

  .af-scroll {
    position: relative;
    overflow-y: hidden;

    ._af_scroll_body {
      position: relative;
    }

    ._af_scroll_column {
      position: absolute;
      right: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: rgba(0,0,0,.1);

      ._af_scroll_block {
        position: relative;
        background: @primary;
        &:hover {
          cursor: pointer;
        }
      }

      &._af_scroll_invisible {
        background: none;
        ._af_scroll_block {
          right: 3px;
          border-radius: 3px;
          visibility: hidden;
          background: @primary;
        }
      }
    }

    &:hover ._af_scroll_invisible ._af_scroll_block {
      visibility: visible;
    }
  }
</style>
