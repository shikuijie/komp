<template>
<div class="km-dropdown" :class="{km_dropdown_visible: visible}">
  <div class="km-input" @click.stop="toggle" :class="{'km-disabled': disabled, 'km-focus': visible}">
    <input type="text" :readonly="readonly" :placeholder="placeholder" :disabled="disabled" :value="text"/>
    <ul class="km_dropdown_labels" v-if="labels">
      <li v-for="label in labels">{{label}} <i class="km-cursor icon-close-small" @click.stop="clear(label)"></i></li>
    </ul>
    <div class="km_dropdown_icon">
      <i class="icon-close km-cursor" v-if="removable" @click.stop="clear()"></i>
      <i :class="`icon-arrow-${this.visible ? 'up' : 'down'}`" class="km-cursor" v-else></i>
    </div>
  </div>
  <div class="km-dropdown-frame" ref="body" :style="bodyPosition">
    <slot></slot>
  </div>
</div>
</template>

<script>
import {isServer} from '../util'

// 点击下拉框之外的位置来隐藏下拉框
const Dropdown = {current: null}
if (!isServer()) {
  document.documentElement.addEventListener('click', () => {
    Dropdown.current && Dropdown.current.$emit('hide')
  })
}

export default {
  created () {
    // 打开下拉框
    this.bus.$on('show', () => {
      // 打开之前关闭页面上的其他下拉框
      if (Dropdown.current && Dropdown.current !== this.bus) {
        Dropdown.current.$emit('hide')
      }
      Dropdown.current = this.bus

      // 调整下拉框的位置
      var pos = this.$refs.body.getBoundingClientRect()
      var ww = window.innerWidth || document.body.clientWidth
      if (pos.left < 0) {
        this.bodyPosition.left = 0
        this.bodyPosition.right = 'auto'
      } else if (pos.right > ww) {
        this.bodyPosition.right = 0
        this.bodyPosition.left = 'auto'
      }
      this.visible = true
      this.$emit('show')
    })
    // 收起下拉框
    this.bus.$on('hide', () => {
      Dropdown.current = null

      this.visible = false
      this.$emit('hide')
    })
  },
  destroyed () {
    this.bus.$off('show')
    this.bus.$off('hide')
  },
  props: [
    'bus', // 和父组件通信
    'readonly', // 文本框是否是只读的
    'disabled', // 文本框是否已经非能了
    'clearable', // 文本框是否可以清空
    'placeholder', // 文本框占位字符串
    'text', // 文本框的显示文本
    'labels' // 文本框显示的多个标签文本
  ],
  data () {
    return {
      visible: false,
      bodyPosition: {
        left: 0,
        right: 'auto'
      }
    }
  },
  computed: {
    removable () {
      if (this.disabled || !this.clearable) {
        return false
      }
      return this.labels ? !!this.labels.length : !!this.text
    }
  },
  methods: {
    toggle () {
      this.bus.$emit(this.visible ? 'hide' : 'show')
    },
    clear (label) {
      this.bus.$emit('clear', label)
    }
  }
}
</script>

<style lang="less">
@import (reference) "../styles/color.less";
@import (reference) "../styles/size.less";
@dropdown-border-radius: @border-radius;
@dropdown-padding: 10px;
@dropdown-padding-right: 12px + 2 * @dropdown-padding;
@zindex-dropdown: 3000;

.km-dropdown {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  overflow: hidden;

  &.km_dropdown_visible {
    overflow: visible;
  }

  .km-input {
    padding-right: @dropdown-padding-right;
    background: white;
  }

  .km_dropdown_labels {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    padding: 0 @dropdown-padding-right 0 @dropdown-padding;
    white-space: nowrap;
    overflow: hidden;

    li {
      display: inline;
      border: 1px solid @border-light;
      padding: 2px;
      margin-right: 5px;
      border-radius: @border-radius;
      cursor: default;

      i {
        font-size: 12px;
      }
    }
  }

  .km_dropdown_icon {
    position: absolute;
    height: 100%;
    width: @dropdown-padding-right;
    top: 0;
    right: 0;
    border: 1px solid @border-light;
    border-left: none;
    border-radius: @dropdown-border-radius;
    text-align: center;
    font-size: 12px;
    background: white;
  }
  &.km_dropdown_visible .km_dropdown_icon {
    border-color: @primary;
  }

  .km-dropdown-frame {
    position: absolute;
    top: 100%;
    width: 100%;
    margin-top: 1px;
    border: 1px solid @border-light;
    border-radius: @dropdown-border-radius;
    background: white;
    z-index: @zindex-dropdown;
  }
}
</style>
