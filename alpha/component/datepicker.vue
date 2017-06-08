<template>
  <div class="af-datime" 
      :class="{_af_datime_clock: hasTime}"
      :style="{overflow: visible ? '' : 'hidden'}">
    <input class="af-input-control" 
          readonly type="text"
          :placeholder="placeholder"
          :value = "fullStr"
          :class="{'af-focus': visible, 'af-disabled': disabled}" @click.stop="toggle">
    <i v-if="!removable" class="_af_datime_caret icon-arrow-down"></i>
    <i v-else class="af-cursor _af_datime_caret icon-close" @click.stop="remove"></i>
    <af-dropdown :visible="visible" @hide="toggle">
      <div class="clearfix">
        <div class="_af_date pull-left">
          <ul class="_af_date_ympicker clearfix">
            <li class="_af_date_prev _af_datime_item pull-left icon-arrow-left" @click.stop="prevMonth"></li>
            <li class="_af_date_next _af_datime_item pull-right icon-arrow-right" @click.stop="nextMonth"></li>
            <li class="_af_date_ym _af_datime_item" v-text="yearMonthStr"></li>
          </ul>
          <table class="_af_date_dpicker">
            <thead>
              <tr>
                <th v-for="w in weeks" v-text="w"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="week in weekdays">
                <td class="_af_datime_item" 
                    :class="{_af_datime_today: isToday(wd), _af_datime_active: isActiveDay(wd)}"
                    v-for="wd in week" @click.stop="selectDate(wd)" v-text="wd">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="_af_time pull-left" v-if="hasTime">
          <ul class="_af_time_picker">
            <li class="_af_datime_item _af_time_prev icon-arrow-up" @click.stop="prevTimes"></li>
            <li>
              <af-scroll :speed="10" init="120px" :bus="scrollBus">
                <ul class="_af_time_list">
                  <li class="_af_datime_item" 
                      :class="{_af_datime_active: isActiveTime(t)}"
                      v-for="t in times" v-text="t" @click.stop="selectTime(t)"></li>
                </ul>
              </af-scroll>
            </li>
            <li class="_af_datime_item _af_time_next icon-arrow-down" @click.stop="nextTimes"></li>
          </ul>
        </div>
      </div>
    </af-dropdown>
  </div>
</template>
<script>
  import {isUndefined, isString, hasVnodeListener} from './util'
  import afScroll from './scroll.vue'
  import afDropdown from './dropdown.vue'
  import Bus from './bus'

  export default {
    name: 'form-datepicker',
    components: {
      afScroll,
      afDropdown
    },
    props: {
      value: String,
      clock: {
        type: String,
        validator (val) {
          return isUndefined(val) || isString(val) && !val
        }
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
      placeholder: String,
      __afCheckError: Boolean,
      __afControlBus: Bus
    },
    data () {
      var times = []
      var hour = null
      for (let i = 7; i < 24; i++) {
        hour = i < 10 ? '0' + i : i
        times.push(hour + ':00')
        times.push(hour + ':30')
      }

      return {
        visible: false,
        weeks: ['日', '一', '二', '三', '四', '五', '六'],
        times,
        current: parseDate(this.value && new Date(this.value.replace(/-/g, '/')) || new Date(), true),
        today: parseDate(new Date()),
        scrollBus: new Bus()
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
    },
    destroyed () {
      if (this.__afControlBus) {
        this.__afControlBus.$off('__afGetValue', this.__af_getValueId)
      }
    },
    computed: {
      active () {
        return this.value && parseDate(new Date(this.value.replace(/-/g, '/')), true)
      },
      hasTime () { // 是否显示时间
        return !isUndefined(this.clock)
      },
      yearMonthStr () { // 显示当前年月
        return `${this.current.year}年${normalize(this.current.month + 1)}月`
      },
      fullStr () { // 用于显示在input中的字符串
        return this.active && formatDate(this.active, this.hasTime)
      },
      weekdays () { // 生成当月每周的日期数组
        var current = this.current
        var month = current.month
        var year = current.year
        var firstDate = new Date(year, month, 1)
        var firstWeekday = firstDate.getDay()
        var lastDay = getLastDay(year, month)
        var lastDate = new Date(year, month, lastDay)
        var lastWeekday = lastDate.getDay()

        var result = []
        var curWeek = []

        for (let i = 1 - firstWeekday, j = 0; i < lastDay + 7 - lastWeekday; i++, j++) {
          if (j % 7 === 0) {
            curWeek = []
            result.push(curWeek)
          }
          curWeek.push(i <= 0 || i > lastDay ? '' : i)
        }

        return result
      },
      removable () {
        return !this.disabled && !isUndefined(this.clear) && this.value !== null
      }
    },
    watch: {
      value (val) {
        if (this.__afControlBus) {
          this.__afControlBus.$emit('__afCheck', val)
        }
        if (val && val !== formatDate(this.current, this.hasTime)) {
          this.current = Object.assign({}, this.active)
        }
      }
    },
    methods: {
      isToday (day) {
        return day === this.today.day && this.current.year === this.today.year && this.current.month === this.today.month
      },
      isActiveDay (day) {
        return this.active && (day === this.active.day && this.current.year === this.active.year && this.current.month === this.active.month)
      },
      isActiveTime (t) {
        return this.active && `${normalize(this.active.hour)}:${normalize(this.active.minute)}` === t
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
      },
      remove () {
        if (!this.removable) {
          return
        }
        this.$emit('input', null)
        if (this.__afChangeHandler) {
          this.$emit('change', null)
        }
      },
      selectTime (t) {
        this.toggle()

        var [hour, minute] = t.split(':')
        hour = parseInt(hour)
        minute = parseInt(minute)
        var year = this.active && this.active.year || this.today.year
        var month = this.active && this.active.month || this.today.month
        var day = this.active && this.active.day || this.today.day
        var nval = formatDate({year, month, day, hour, minute}, true)

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
          this.$emit('change', nval)
        }
      },
      selectDate (day) {
        if (!this.hasTime) {
          this.toggle()
        }

        var hour = this.active && this.active.hour || 0
        var minute = this.active && this.active.minute || 0
        var target = Object.assign({}, this.current)
        target.day = day
        var nval = formatDate({...target, hour, minute}, this.hasTime)

        this.$emit('input', nval)
        if (this.__afChangeHandler) {
          this.$emit('change', nval)
        }
      },
      prevMonth () {
        var month = this.current.month
        var year = this.current.year

        month--
        if (month < 0) {
          month = 11
          year--
        }
        this.current.month = month
        this.current.year = year
      },
      nextMonth () {
        var month = this.current.month
        var year = this.current.year

        month++
        if (month > 11) {
          month = 0
          year++
        }

        this.current.month = month
        this.current.year = year
      },
      prevTimes () {
        this.scrollBus.$emit('scroll', '-100%')
      },
      nextTimes () {
        this.scrollBus.$emit('scroll', '100%')
      }
    }
  }

  function parseDate (date, needTime) {
    var res = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate()
    }

    if (needTime) {
      res.hour = date.getHours()
      res.minute = date.getMinutes()
    }
    return res
  }

  function formatDate (date, hasTime) {
    var dateStr = `${date.year}-${normalize(date.month + 1)}-${normalize(date.day)}`
    var timeStr = hasTime && ` ${normalize(date.hour)}:${normalize(date.minute)}` || ''
    return dateStr + timeStr
  }

  function normalize (num) {
    return num < 10 ? '0' + num : num
  }

  function isLeapYear (y) {
    return ((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0)
  }

  function getLastDay (y, m) {
    let days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (isLeapYear(y)) {
      days[1] = 29
    }
    return days[m]
  }
</script>
<style lang="less">
  @import (reference) "../style/variable.less";

  .af-datime {
    display: inline-block;
    position: relative;
    width: 100%;
    background: #fff;
    color: @dark;
    font-size: 14px;
    line-height: normal;

    .af-dropdown {
      margin-top: 1px;
      width: 267px;
    }

    &._af_datime_clock .af-dropdown {
      width: 342px;
    }

    .af-input-control {
      padding-right: 25px;
    }

    ._af_datime_caret {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: @light;
      font-size: 12px;
    }

    ._af_datime_item:hover {
      color: @primary;
      cursor: pointer;
    }

    ._af_date {
      position: relative;
      width: 265px;

      ul._af_date_ympicker {
        border-bottom: 1px dashed @border-light;
        font-size: 18px;

        li {
          height: 60px;
          line-height: 60px;

          &._af_date_prev {
            padding-left: 15px;
          }
          &._af_date_next {
            padding-right: 15px;
          }

          &._af_date_ym {
            margin: 0 auto;
            width: 200px;
            text-align: center;
          }
        }
      }

      table._af_date_dpicker {
        width: 244px;
        margin: 0 auto;
        thead {
          th {
            width: 35px;
            height: 40px;
            text-align: center;
            font-weight: normal;
          }
        }
        tbody {
          td {
            width: 35px;
            height: 35px;
            border: none;
            text-align: center;

            &._af_datime_active {
              border-radius: 17px;
              background: @primary;
              color: #fff;
            }

            &._af_datime_today {
              position: relative;
              &._af_datime_active:after {
                color: #fff;
              }

              &:after {
                position: absolute;
                left: 14px;;
                bottom: -5px;
                content: ".";
                font-size: 30px;
                color: @primary;
              }
            }
          }
        }
      }
    }

    ._af_time {
      position: relative;
      width: 75px;
      height: 100%;
      border-left: 1px solid @primary-light;
      text-align: center;

      ._af_datime_item {
        height: 30px;
        line-height: 30px;

        &._af_datime_active {
          color: @primary;
        }
      }

      ._af_time_prev,
      ._af_time_next {
        font-size: 18px;
      }

      .af-scroll {
        height: 216px;
      }
    }
  }
</style>