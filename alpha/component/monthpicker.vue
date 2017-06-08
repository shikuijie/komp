<template>
<div class="af-monthpicker _af_month_picker" :style="monthStyle">
  <input :class="selectedClass" 
         :value="selectedValue" 
         @click.stop="toggle($event)"
         readonly
         class="af-input-control" type="text">
  <i v-if="!removable" class="_af_picker_caret icon-arrow-down"></i>
  <i v-else class="af-cursor _af_picker_caret icon-close" @click.stop="remove"></i>
  <af-dropdown :visible="visible" @hide="toggle">
    <ul class="_af_year pull-left">
      <li class="_af_year_prev icon-arrow-up" @click.stop="prevTimes"></li>
      <li>
        <af-scroll :speed="3" :bus="scrollBus" style="height:180px;">
          <ul class="_af_year_list">
            <li class="_af_year_item af-option"
                v-for="t in years" v-text="t.label"
                :class="{_af_year_active: isActiveYear(t.label)}"
                @click.stop="selectYear(t)"></li>
          </ul>
        </af-scroll>
      </li>
      <li class="_af_year_next icon-arrow-down" @click.stop="nextTimes"></li>
    </ul>
    <ul class="_af_month">
      <li class="_af_month_item"
          v-for="month in months"
          v-text="`${month}月`"
          :class="{_af_month_active: isActiveMonth(month)}"
          @click.stop="selectMonth(month)"></li>
    </ul>
  </af-dropdown>    
</div>
</template>
<script>
  import {hasVnodeListener, isUndefined} from './util'
  import afScroll from './scroll.vue'
  import afDropdown from './dropdown.vue'
  import Bus from './bus'

  export default {
    name: 'form-monthpicker',
    components: {
      afScroll,
      afDropdown
    },
    props: {
      value: String,
      length: {
        type: Number,
        default: 20
      },
      maxYear: {
        type: Number
      },
      disabled: {
        type: Boolean,
        default: false
      },
      clear: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      },
      nowText: {
        type: String,
        default: '至今'
      },
      __afControlBus: Bus
    },
    data () {
      return {
        visible: false,
        selectedYear: null,
        selectedMonth: null,
        scrollBus: new Bus()
      }
    },
    watch: {
      value (nval) {
        this.addValue(nval)
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', nval)
        }
      }
    },
    computed: {
      years () {
        let currentYear = new Date().getFullYear()
        let year = Array.from(new Array(this.length), (i, k) => {
          return {
            label: this.maxYear ? this.maxYear - k : currentYear - k,
            value: `${currentYear - k}`
          }
        })
        if (!this.maxYear) {
          year.unshift({label: this.nowText, value: '2888/08/08'})
        }
        return year
      },
      months () {
        return Array.from({length: 12}, (i, k) => k + 1)
      },
      selectedValue () {
        let year, month
        year = this.selectedYear ? `${this.selectedYear}` : ''
        month = this.selectedMonth ? `-${prefix(this.selectedMonth)}` : ''
        return year + month
      },
      monthStyle () {
        return {
          overflow: this.visible ? '' : 'hidden'
        }
      },
      selectedClass () {
        return {
          'af-focus': this.visible,
          'af-disabled': this.disabled
        }
      },
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null
      }
    },
    mounted () {
      this.__afShowHandler = hasVnodeListener(this.$vnode, 'show')
      this.__afHideHandler = hasVnodeListener(this.$vnode, 'hide')
      this.__afChangeHandler = hasVnodeListener(this.$vnode, 'change')

      if (this.__afControlBus) {
        this.__af_getValueId = this.__afControlBus.$on('__afGetValue', cb => {
          return cb(this.value)
        })
        this.__afControlBus.$emit('__afCheck', this.value)
      }
      if (this.value) {
        this.addValue(this.value)
      }
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__af_getValueId)
      }
    },
    methods: {
      remove () {
        if (!this.removable) {
          return
        }
        this.$emit('input', null)
        if (this.__afChangeHandler) {
          this.$emit('change', null)
        }
      },
      selectYear (yearObj) {
        var nval = null
        this.selectedYear = yearObj.label
        if (yearObj.label === this.nowText) {
          this.selectedMonth = null
          nval = yearObj.value
          this.toggle()
        } else {
          if (!this.selectedMonth) {
            this.selectedMonth = 1
          }
          nval = `${yearObj.value}/${prefix(this.selectedMonth)}`
        }

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
          this.$emit('change', nval)
        }
      },
      selectMonth (month) {
        if (!this.selectedYear) {
          return
        } else if (this.selectedYear === this.nowText) {
          this.toggle()
          return
        } else {
          this.toggle()
          let nval = `${this.selectedYear}/${prefix(month)}`
          this.selectedMonth = month
          this.$emit('input', nval)
          if (this.__afChangeHandler) {
            this.$emit('change', nval)
          }
        }
      },
      isActiveMonth (month) {
        return month === this.selectedMonth
      },
      isActiveYear (year) {
        return year === this.selectedYear
      },
      prevTimes () {
        this.scrollBus.$emit('scroll', '-100%')
      },
      nextTimes () {
        this.scrollBus.$emit('scroll', '100%')
      },
      addValue (value) {
        var date = null
        if (value) {
          value = value.replace(/-/g, '/')
          // 火狐浏览器不支持 new Date('2015/05')
          if (value.length <= 7) {
            value += '/01'
          }
          date = new Date(value)
        }

        this.selectedYear = null
        this.selectedMonth = null

        if (!date) {
          return
        }
        if (date.getTime() >= new Date('2888/08/08').getTime()) {
          this.selectedYear = this.nowText
          return
        }
        this.selectedYear = date.getFullYear()
        this.selectedMonth = date.getMonth() + 1
      },
      toggle () {
        if (this.disabled) {
          return
        }
        var event = this.visible ? 'hide' : 'show'
        var emit = this.visible ? this.__afHideHandler : this.__afShowHandler
        if (emit) {
          this.$emit(event)
        }

        this.visible = !this.visible
        if (!this.visible && this.__afControlBus) {
          this.__afControlBus.$emit('__afShowError')
        }
      }
    }
  }
  function prefix (num) {
    return num < 10 ? `0${num}` : num
  }
</script>
<style lang="less">
@import (reference) "../style/variable.less";
._af_month_picker {
  display: inline-block;
  position: relative;
  width: 100%;

  .af-dropdown {
    min-height: 120px;
  }
  .af-input-control {
    padding-right: 25px;
  }
  ._af_picker_caret {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #999999;
    font-size: 12px;
  }
  ._af_year {
    width: 100px;
    border-right: 1px solid @border-light;
  }
  ._af_year_prev,
  ._af_year_next {
    line-height: 20px;
    text-align: center;
    cursor: pointer;
  }
  ._af_year_item {
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    &:hover {
      background: @hover-bg;
      color: @primary;
    }
  }
  ._af_month {
    width: 220px;
    height: 220px;
    margin-left: 100px;
    padding: 24px 5px;
    ._af_month_item {
      display: inline-block;
      width: 70px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;
      &:hover {
        background-color: @hover-bg;
        color: @primary;
      }
    }
  }
  ._af_year_active,
  ._af_month_active {
    background-color: @hover-bg;
    color: @primary;
  }

}
</style>