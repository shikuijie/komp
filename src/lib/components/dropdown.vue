<template>
<div class="km-dropdown" :class="{km_dropdown_visible: visible}">
  <div class="km-input" @click.stop="toggle" :class="{'km-disabled': disabled, 'km-focus': visible}">
    <!-- 显示一个标签 -->
    <input type="text" :readonly="readonly" 
          :placeholder="placeholder"
          v-model="text"/>
    <!-- 显示多个标签 -->
    <ul class="km_dropdown_labels" v-if="labels">
      <li v-for="label in labels">{{label}} <i class="km-cursor icon-close-small" @click.stop="clear(label)"></i></li>
    </ul>
    <!-- 箭头指示图标和清除图标 -->
    <div class="km_dropdown_icon">
      <i class="icon-close km-cursor" v-if="removable" @click.stop="clear()"></i>
      <i :class="`icon-arrow-${this.visible ? 'up' : 'down'}`" class="km-cursor" v-else></i>
    </div>
  </div>
  <!-- 下拉框内容区域 -->
  <div class="km-dropdown-frame" ref="body" :style="bodyPosition">
    <div v-if="loading" class="km_dropdown_load">加载中，请稍候</div>
    <slot v-else></slot>
  </div>
</div>
</template>

<script>
import {isServer} from '../util'

// 点击下拉框之外的位置来隐藏下拉框
const Dropdown = {current: null}
if (!isServer()) {
  document.documentElement.addEventListener('click', () => {
    Dropdown.current && Dropdown.current.$emit('dropdown.hide')
  })
}

export default {
  created () {
    // 打开下拉框
    this.bus.$on('dropdown.show', () => {
      if (this.disabled) {
        return
      }

      // 打开之前，关闭页面上的其他下拉框
      if (Dropdown.current && Dropdown.current !== this.bus) {
        Dropdown.current.$emit('dropdown.hide')
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
      // 父组件发送 show 事件
      this.$parent.$emit('show')
    })

    // 收起下拉框
    this.bus.$on('dropdown.hide', () => {
      Dropdown.current = null

      this.visible = false
      // 父组件发送 hide 事件
      this.$parent.$emit('hide')
    })
  },
  destroyed () {
    this.bus.$off('dropdown.show')
    this.bus.$off('dropdown.hide')
  },
  props: [
    'bus', // 和父组件通信
    'readonly', // 文本框是否是只读的
    'disabled', // 文本框是否已经非能了
    'clearable', // 文本框是否可以清空
    'eventToClear', // 是否发送事件来清空
    'placeholder', // 文本框占位字符串
    // labels 和 label 不能同时存在
    'labels', // 多选下拉框的选中标签
    'label', // 其他文本框的显示文本
    'loading' // 下拉框中的内容正在加载
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
      if (this.disabled || this.loading || !this.clearable) {
        return false
      }
      return this.labels ? !!this.labels.length : !!this.label
    },
    text: {
      get () {
        return this.label
      },
      set (val) {
        this.bus.$emit('dropdown.change', val)
      }
    }
  },
  methods: {
    toggle () {
      this.bus.$emit(this.visible ? 'dropdown.hide' : 'dropdown.show')
    },
    clear (label) {
      if (!this.eventToClear) {
        // 非多选下拉框直接清空父组件中的 value 值
        this.$parent.$emit('input', null)
      } else {
        // 多选下拉框则通知父组件自己处理
        this.bus.$emit('dropdown.clear', label)
      }
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
    width: 100%;
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

    .km_dropdown_load {
      height: 100px;
      line-height: 100px;
      text-align: center;
    }
  }
}
</style>
