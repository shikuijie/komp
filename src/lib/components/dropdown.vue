<template>
<div class="km-dropdown" @click.stop="() => {}"
  :class="{km_dropdown_visible: visible, km_dropdown_active: active}">
  <div class="km-input" @click.stop="toggle" :class="{'km-disabled': disabled, 'km-focus': active}">
    <!-- 显示一个文本 -->
    <input type="text" v-if="readonly" :readonly="true" 
          :placeholder="placeholder" :value="label">

    <!-- label slot  -->
    <slot name="label"></slot>

    <!-- 箭头指示图标和清除图标 -->
    <div class="km_dropdown_icon">
      <i class="icon-close km-pointer" v-if="removable" @click.stop="clear()"></i>
      <i :class="`icon-arrow-${visible ? 'up' : 'down'}`" class="km-pointer" v-else></i>
    </div>
  </div>
  <!-- 下拉框内容区域 -->
  <div class="km-dropdown-frame" ref="body" :style="bodyPosition">
    <slot></slot>
  </div>
</div>
</template>

<script>
import {isServer} from 'lib/util'
import {hasListener} from 'lib/vnode'

// 点击下拉框之外的位置来隐藏下拉框
const Dropdown = {bus: null}
if (!isServer()) {
  document.documentElement.addEventListener('click', () => {
    Dropdown.bus && Dropdown.bus.$emit('dropdown.hide')
  })
}

export default {
  props: [
    'bus', // 和父组件通信
    'label', // 显示文本
    'readonly', // 文本框是否是只读的
    'disabled', // 文本框是否已经非能了
    'placeholder', // 文本框占位字符串
    'loading' // 下拉框中的内容正在加载
  ],
  data () {
    return {
      active: false,
      bodyPosition: {
        left: 0,
        right: 'auto'
      },
      text: null,
      labels: null,

      inputing: false,
    }
  },
  computed: {
    removable () {
      return !this.disabled && !this.loading && this.label
    },
    visible () {
      return this.active && !this.loading
    }
  },
  methods: {
    toggle () {
      // 可编辑下拉框在收起状态下能点击展开，但在展开状态下并不会点击收起
      if (!this.readonly && this.active) {
        return
      }
      this.bus.$emit(this.active ? 'dropdown.hide' : 'dropdown.show')
    },
    clear () {
      if (this.mHasClearEvent) {
        // 通知父组件自己处理
        this.$emit('clear')
      } else {
        // 直接清空父组件中的 value 值
        this.$parent.$emit('input', null)
      }
    }
  },
  created () {
    this.mHasClearEvent = hasListener(this.$vnode, 'clear')
    // 打开下拉框
    this.bus.$on('dropdown.show', () => {
      if (this.disabled) {
        return
      }

      // 打开之前，关闭页面上的其他下拉框
      if (Dropdown.bus) {
        if (Dropdown.bus !== this.bus) {
          Dropdown.bus.$emit('dropdown.hide')
        } else {
          return
        }
      }
      Dropdown.bus = this.bus

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
      this.active = true
      // 父组件发送 show 事件
      this.$parent.$emit('show')
    })

    // 收起下拉框
    this.bus.$on('dropdown.hide', () => {
      Dropdown.bus = null

      this.active = false
      // 父组件发送 hide 事件
      this.$parent.$emit('hide')
    })
  },
  destroyed () {
    this.bus.$off('dropdown.show')
    this.bus.$off('dropdown.hide')
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";
@import (reference) "~style/size.less";
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
    padding-right: @input-padding-right;
    background: white;
  }

  .km_dropdown_labels {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    padding: 0 @input-padding-right 0 @input-padding-left;
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
    width: @input-padding-right;
    top: 0;
    right: 0;
    border: 1px solid @border-light;
    border-left: none;
    border-radius: @border-radius;
    text-align: center;
    font-size: 12px;
    background: white;
  }
  &.km_dropdown_active .km_dropdown_icon {
    border-color: @primary;
  }

  .km-dropdown-frame {
    position: absolute;
    top: 100%;
    width: 100%;
    margin-top: 1px;
    border: 1px solid @border-light;
    border-radius: @border-radius;
    background: white;
    z-index: @zindex-dropdown;
  }
}
</style>
