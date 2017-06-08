<template>
  <div class="af-pager">
    <div class="_af_pager_front">
      <span 
        class="_af_pager_first" 
        :class="{_af_pager_disabled: currentPage === 1}" 
        @click="goFirst">首页</span><span 
        class="_af_pager_prev" 
        :class="{_af_pager_disabled: currentPage === 1}" 
        @click="goPrev">上一页</span>
    </div><div class="_af_pager_middle">
      <span 
        :class="{active: currentPage === pager}" 
        @click="go(pager)" 
        v-for="pager in pagers">{{pager}}</span>
    </div><div class="_af_pager_end">
      <span class="_af_pager_next" 
        :class="{_af_pager_disabled: currentPage === totalPages}" 
        @click="goNext">下一页</span><span class="_af_pager_last" 
        :class="{_af_pager_disabled: currentPage === totalPages}" 
        @click="goLast">尾页</span>
    </div>
  </div>
</template>
<script>
  import {hasVnodeListener} from './util'
  export default {
    props: {
      value: Number,
      // 每页显示少想项
      limit: {
        type: Number,
        default: 20
      },
      disabled: {
        type: Boolean,
        default: false
      },
      // 共有多少项
      total: {
        type: Number,
        default: 0
      },
      // 可见多少页
      size: {
        type: Number,
        default: 5
      }
    },
    mounted () {
      this.__afHasChangeHandler = hasVnodeListener(this.$vnode, 'change')
    },
    computed: {
      currentPage () {
        return this.value > this.totalPages ? this.totalPages : this.value
      },
      // 计算多少页
      totalPages () {
        return Math.ceil(+this.total / this.limit)
      },
      _size () {
        return this.totalPages < this.size ? this.totalPages : this.size
      },
      pagers () {
        let init = this.currentPage - Math.ceil(this._size / 2)
        if (init + this._size >= this.totalPages) {
          init = this.totalPages - this._size
        }
        if (init <= 0) {
          init = 0
        }
        return Array.from({length: this._size}, (v, k) => {
          return init + k + 1
        })
      }
    },
    methods: {
      // 跳转页码
      go (page) {
        if (this.disabled) {
          return
        }

        if (page <= 1) {
          page = 1
        } else if (page >= this.totalPages) {
          page = this.totalPages
        }

        if (page === this.currentPage) {
          return
        }

        this.$emit('input', page)
        if (this.__afHasChangeHandler) {
          this.$emit('change', page)
        }
        window.scrollTo(0, 0)
      },
      // 首页
      goFirst () {
        this.go(1)
      },
      // 上一页
      goPrev () {
        this.go(this.currentPage - 1)
      },
      // 下一页
      goNext () {
        this.go(this.currentPage + 1)
      },
      // 尾页
      goLast () {
        this.go(this.totalPages)
      }
    }
  }
</script>
<style lang="less">
  @import (reference) "~style/variable.less";

  .af-pager div{
    display: inline-block;
  }
  .af-pager span {
    box-sizing: border-box;
    display: inline-block;
    font-size: 14px;
    height: 31px;
    line-height: 31px;
    border: 1px solid @border-light;
    background-color: #fff;
    color: @gray;
    text-align:center;
    cursor: pointer;
    margin-right: 11px;
  }
  ._af_pager_first,
  ._af_pager_last {
    width: 52px;
  }
  ._af_pager_prev,
  ._af_pager_next {
    width: 64px;
  }
  ._af_pager_middle span {
    padding: 0 4px;
    min-width: 31px;
  }
  .af-pager .active,
  ._af_pager_middle span:hover {
    background-color: @primary;
    color: #fff;
    border: 1px solid @primary;
  }
  .af-pager ._af_pager_disabled {
    color: #ccc;
    cursor: default;
  }
</style>