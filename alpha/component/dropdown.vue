<template>
  <div class="af-dropdown" :style="position" :class="{_af_dropdown_visible: visible}">
    <slot></slot>
  </div>
</template>
<script>
  import Vue from 'vue'
  import {getElementPosition} from './util'

  const BUS = new Vue()
  document.documentElement.addEventListener('click', () => {
    BUS.__afCurrent && BUS.__afCurrent.$emit('hide')
  })

  export default {
    props: {
      visible: Boolean
    },
    data () {
      return {
        position: {
          left: 0,
          // top: '100%',
          right: 'auto'
          // bottom: 'auto',
          // margin: '1px 0 0'
        }
      }
    },
    watch: {
      visible (val) {
        if (val) {
          BUS.__afCurrent && BUS.__afCurrent.$emit('hide')
          BUS.__afCurrent = this
          this.adjust()
        } else {
          if (BUS.__afCurrent === this) {
            BUS.__afCurrent = null
          }
          this.clear()
        }
      }
    },
    methods: {
      adjust () {
        var sl = window.pageXOffset || document.documentElement.scrollLeft
        // var st = window.pageYOffset || document.documentElement.scrollTop
        var ww = document.documentElement.clientWidth
        // var wh = document.documentElement.clientHeight

        var rect = getElementPosition(this.$el)
        if (rect.right > ww + sl) {
          this.position.right = 0
          this.position.left = 'auto'
        }

        // if (rect.bottom > wh + st) {
        //   this.position.bottom = '100%'
        //   this.position.top = 'auto'
        //   this.position.margin = '0 0 1px'
        // }
      },
      clear () {
        window.setTimeout(() => {
          this.position.left = 0
          this.position.right = 'auto'
          // this.position.top = '100%'
          // this.position.bottom = 'auto'
          // this.position.margin = '1px 0 0'
        }, 20)
      }
    }
  }
</script>
<style lang="less">
  @import (reference) '../style/variable.less';

  .af-dropdown {
    position: absolute;
    top: 100%;
    margin: 1px 0 0;
    border: 1px solid @border-light;
    border-radius: 2px;
    box-shadow: 0 2px 3px rgba(0,0,0,.08);
    background: #fff;
    // visibility: hidden;
    // opacity: 0;
    // z-index: -1;

    &._af_dropdown_visible {
      // visibility: visible;
      // opacity: 1;
      z-index: @zindex-dropdown;
    }
  }
</style>