<template>
  <div class="km-scroll km-clearfix">
    <div class="km_scroll_body km-pull-left" ref="body" @wheel="wheel" :style="{top: -offset.Y + 'px', left: -offset.X + 'px'}">
      <slot></slot>
    </div>
    <div class="km_scroll_bar km_scroll_y" :class="{km_scroll_hidden: hidden, km_scroll_dragging: dragging.Y}" v-if="!noscroll.Y">
      <div class="km_scroll_block" @mousedown.stop="startDrag('Y', $event.clientY)" :style="{height: blockSize.Y + 'px', top: (offset.Y / unit.Y) + 'px'}"></div>
    </div>
    <div class="km_scroll_bar km_scroll_x" :class="{km_scroll_hidden: hidden, km_scroll_dragging: dragging.X}" v-if="!noscroll.X">
      <div class="km_scroll_block" @mousedown.stop="startDrag('X', $event.clientX)" :style="{width: blockSize.X + 'px', left: (offset.X / unit.X) + 'px'}"></div>
    </div>
  </div>
</template>

<script>
  import Bus from 'lib/bus'
  import {isServer} from 'lib/util'

  const Scroll = {ctx: null, pos: 0, us: 'none'}
  if (!isServer()) {
    document.documentElement.addEventListener('mousemove', event => {
      if (!Scroll.ctx) {
        return
      }
      var {ctx, pos} = Scroll
      var dir = ctx.dragging.X ? 'X' : 'Y'
      var delta = event[`client${dir}`] - pos
      var offset = ctx.offset[dir] + ctx.unit[dir] * delta

      if (offset > ctx.mBodySize[dir] - ctx.mElSize[dir]) {
        offset = ctx.mBodySize[dir] - ctx.mElSize[dir]
      } else if (offset < 0) {
        offset = 0
      }
      ctx.offset[dir] = offset

      Scroll.pos = event[`client${dir}`]
    })

    document.documentElement.addEventListener('mouseup', event => {
      if (!Scroll.ctx) {
        return
      }
      var dir = Scroll.ctx.dragging.X ? 'X' : 'Y'
      Scroll.ctx.dragging[dir] = false
      document.documentElement.style.userSelect = Scroll.us
      Scroll.ctx = null
    })
  }

  export default {
    props: {
      bus: {
        type: Bus,
        default () {
          return new Bus()
        }
      },
      hidden: Boolean
    },
    data () {
      return {
        offset: {X: 0, Y: 0},
        unit: {X: 1, Y: 1},
        blockSize: {X: 0, Y: 0},
        noscroll: {X: true, Y: true},
        dragging: {X: false, Y: false}
      }
    },
    created () {
      this.mSpeed = 8
      this.mElSize = {X: 0, Y: 0}
      this.mBodySize = {X: 0, Y: 0}
      this.mScrolling = {X: false, Y: false}
      this.bus.$on('scroll.reset', (dir, init) => {
        if (!/[xXyY]/.test(dir)) {
          console.warn("Scroll's 'reset' event only take x|X|y|Y as the first argument")
          return
        }
        this.reset(dir.toUpperCase(), init)
      })
      this.bus.$on('scroll.run', (dir, size) => {
        if (!/[xXyY]/.test(dir)) {
          console.warn("Scroll's 'run' event only take x|X|y|Y as the first argument")
          return
        }
        this.scroll(dir.toUpperCase(), size)
      })
      this.bus.$on('scroll.scrollable', dir => !this.noscroll[dir.toUpperCase()])
    },
    mounted () {
      this.bus.$emit('scroll.reset', 'x')
      this.bus.$emit('scroll.reset', 'y')
    },
    destroyed () {
      this.bus.$off('scroll.reset')
      this.bus.$off('scroll.run')
      this.bus.$off('scroll.scrollable')
    },
    methods: {
      startDrag (dir, pos) {
        this.dragging[dir] = true
        Scroll.ctx = this
        Scroll.pos = pos
        Scroll.us = document.documentElement.style.userSelect
        document.documentElement.style.userSelect = 'none'
      },
      reset (dir, init) {
        var prop = dir === 'X' ? 'width' : 'height'
        this.mElSize[dir] = this.$el.getBoundingClientRect()[prop]
        this.mBodySize[dir] = this.$refs.body.getBoundingClientRect()[prop]

        if (this.mBodySize[dir] <= this.mElSize[dir]) {
          this.noscroll[dir] = true
        } else {
          this.noscroll[dir] = false
          this.blockSize[dir] = this.mElSize[dir] * this.mElSize[dir] / this.mBodySize[dir]
          // scroll block 每滚动一个像素，scroll body 会滚动 unit 个像素
          this.unit[dir] = (this.mBodySize[dir] - this.mElSize[dir]) / (this.mElSize[dir] - this.blockSize[dir])
        }

        if (init) {
          this.offset[dir] = this.normalize(dir, init)
        }
        if (this.noscroll[dir]) {
          this.offset[dir] = 0
        } else {
          let max = this.mBodySize[dir] - this.mElSize[dir]
          if (this.offset[dir] > max) {
            this.offset[dir] = max
          }
        }
      },
      /**
       * 规范化用户提供的 offset 值
       * +123px 表示往下滚动 123 像素
       * -123px 表示往上滚动 123 像素
       *  123px 表示将 this.offset 设置为 123 像素
       *  +100% 表示往下滚动一屏
       *  -100% 表示往上滚动一屏
       *   100% 表示将 this.offset 设置为整屏高度
       */
      normalize (dir, offset) {
        var re = /^([+-])?(\d+)(px|%)$/
        var match = offset.match(re)
        if (!match) {
          return console.warn('Scroll offset format: [+-]?\\d+(px|%)')
        }

        var result = this.offset[dir]
        offset = match[3] === 'px' ? +match[2] : +match[2] * this.mElSize[dir] / 100
        switch (match[1]) {
          case '+':
            result = this.offset[dir] + offset
            break
          case '-':
            result = this.offset[dir] - offset
            break
          default:
            result = offset
            break
        }
        return result
      },
      scroll (dir, size) {
        if (this.noscroll[dir] || this.mScrolling[dir]) {
          return
        }
        this.mScrolling[dir] = true

        var offset = this.normalize(dir, size)
        if (offset >= this.mBodySize[dir] - this.mElSize[dir]) {
          offset = this.mBodySize[dir] - this.mElSize[dir]
        } else if (offset <= 0) {
          offset = 0
        }
        var sign = offset > this.offset[dir] ? 1 : -1

        // 16ms 滚动一次
        var self = this
        var px = sign * this.mSpeed
        window.setTimeout(function step () {
          if (sign * (self.offset[dir] + px - offset) > 0) {
            self.offset[dir] = offset
            self.mScrolling[dir] = false
          } else {
            self.offset[dir] += px
            window.setTimeout(step, 16)
          }
        })
      },
      // 当只能左右滚动时，鼠标的滚轮可以控制左右滚动
      wheel ($event) {
        var dir = null
        if (!this.noscroll.Y) {
          dir = 'Y'
        } else if (!this.noscroll.X) {
          dir = 'X'
        } else {
          return
        }

        $event.preventDefault()
        $event.stopPropagation()

        var offset = this.offset[dir]
        if ($event.deltaY > 0) {
          let max = this.mBodySize[dir] - this.mElSize[dir]
          if (offset + this.mSpeed >= max) {
            offset = max
          } else {
            offset += this.mSpeed
          }
        } else {
          if (offset - this.mSpeed <= 0) {
            offset = 0
          } else {
            offset -= this.mSpeed
          }
        }

        this.offset[dir] = offset
      }
    }
  }
</script>

<style lang="less">
  @import (reference) "~style/color.less";

  .km-scroll {
    position: relative;
    overflow: hidden;

    .km_scroll_body {
      position: relative;
      min-width: 100%;
      min-height: 100%;
    }

    .km_scroll_bar {
      position: absolute;
      background: rgba(0,0,0,.1);
      z-index: 1;

      &.km_scroll_x {
        left: 0;
        bottom: 0;
        height: 4px;
        width: 100%;

        .km_scroll_block {
          height: 100%;
        }
      }

      &.km_scroll_y {
        right: 0;
        top: 0;
        width: 4px;
        height: 100%;
      }

      &.km_scroll_hidden {
        background: none;

        .km_scroll_block {
          visibility: hidden;
          background: @primary;
        }
      }

      .km_scroll_block {
        position: relative;
        border-radius: 3px;
        background: @primary;
        &:hover {
          cursor: pointer;
        }
      }
    }

    &:hover .km_scroll_hidden .km_scroll_block,
    .km_scroll_dragging.km_scroll_hidden .km_scroll_block {
      visibility: visible;
    }
  }
</style>
