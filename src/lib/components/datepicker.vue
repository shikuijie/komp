<template>
<Dropdown class="km-datime" :class="{km_date_time: hastime}"
          :bus="bus" :readonly="true" :placeholder="placeholder" 
          :clearable="clearable" :disabled="disabled">
  <div class="km-clearfix km_datime_frame" @click.stop="() => {}">
    <div class="km_date km-pull-left">
      <!-- 当前年月及其调整按钮 -->
      <ul class="km_date_head km-clearfix">
        <li class="km_date_prev km-pull-left"><i class="km-cursor icon-dcaret-left" @click.stop="prevYear"></i></li>
        <li class="km_date_prev km-pull-left"><i class="km-cursor icon-caret-left" @click.stop="prevMonth"></i></li>
        <li class="km_date_next km-pull-right"><i class="km-cursor icon-dcaret-right" @click.stop="nextYear"></i></li>
        <li class="km_date_next km-pull-right"><i class="km-cursor icon-caret-right" @click.stop="nextMonth"></i></li>
        <li class="km_date_yymm">{{yearMonthStr}}</li>
      </ul>
      <table class="km_date_body">
        <!-- 周名作为表头 -->
        <thead>
          <tr>
            <th v-for="(w, i) in weeks" :key="`${w}${i}`">{{w}}</th>
          </tr>
        </thead>
        <!-- 日期作为表体 -->
        <tbody>
          <tr v-for="(week, i) in weekdays" :key="i">
            <td class="km_date_dd" 
                :class="{km_date_today: isToday(wd), km_date_active: isActiveDay(wd)}"
                v-for="(wd, i) in week" :key="`${wd}${i}`" @click.stop="selectDate(wd)">{{wd}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 时间选择器 -->
    <div class="km_time km-pull-left" v-if="hastime">
      <ul class="km_time_bar">
        <li class="km_time_prev"><i class="km-cursor icon-arrow-up" @click.stop="prevTimes"></i></li>
        <li class="km_time_list">
          <!-- 备选时间列表，间隔30s -->
          <Scroll :bus="bus" :hidden="true">
            <ul>
              <li :class="{km_time_active: isActiveTime(t)}"
                  v-for="(t, i) in times" :key="`${t}${i}`" @click.stop="selectTime(t)">{{t}}</li>
            </ul>
          </Scroll>
        </li>
        <li class="km_time_next"><i class="km-cursor icon-arrow-down" @click.stop="nextTimes"></i></li>
      </ul>
    </div>
  </div>
</Dropdown>
</template>

<script>
import Dropdown from './dropdown.vue'
import Scroll from './scroll.vue'
import Bus from '../bus'
export default {
  components: {
    Dropdown,
    Scroll
  },
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    },
    controlBus: Bus,
    // value: 格式统一为'yyyy-mm-dd hh:mi'
    value: String,
    // 是否有时间列
    hastime: Boolean,
    // 传递给 Dropdown 的属性
    disabled: Boolean,
    placeholder: String,
    clearable: Boolean
  },
  data () {
    var times = []
    var hour = null
    for (let i = 7; i < 24; i++) {
      hour = normalize(i)
      times.push(hour + ':00')
      times.push(hour + ':30')
    }

    return {
      visible: false,
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      times,
      currentDate: parseDate(this.value),
      today: parseDate()
    }
  },
  created () {
    this.controlBus && this.controlBus.$on('control.getvalue', () => this.value)
  },
  destroyed () {
    this.controlBus && this.controlBus.$off('control.getvalue')
  },
  mounted () {
    var start = 7
    var offset = 0
    if (this.hastime && this.currentDate.hh && this.currentDate.mm) {
      offset = (this.currentDate.hh - start) * 2
    }
    this.bus.$emit('dropdown.change', this.fullStr)
    this.bus.$emit('scroll.reset', 'y', (offset || 4) * 30 + 'px')
  },
  computed: {
    // value 对应的对象结构
    valueObj () {
      return this.value && parseDate(this.value)
    },
    // 当前年月
    yearMonthStr () {
      return `${this.currentDate.yyyy}年${normalize(this.currentDate.mm)}月`
    },
    // Dropdown 文本框中显示的字符串
    fullStr () {
      return this.valueObj && formatDate(this.valueObj, this.hastime)
    },
    // 当月每周的日期数组
    weekdays () {
      var currentDate = this.currentDate
      var month = currentDate.mm - 1
      var year = currentDate.yyyy
      // 计算月度第一天的日期
      var firstDate = new Date(year, month, 1)
      var firstWeekday = firstDate.getDay()
      // 计算月度最后一天的日期
      var lastDay = getLastDay(year, month)
      var lastDate = new Date(year, month, lastDay)
      var lastWeekday = lastDate.getDay()

      var result = []
      var curWeek = []

      // 遍历月度的每一天，将同一周的日期放入一个 curWeek
      // 最后 result 中存放的是月度所有的周日期数组
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
      return !this.disabled && this.clearable && this.value
    }
  },
  watch: {
    value (val, oval) {
      this.bus.$emit('dropdown.change', this.fullStr)
    }
  },
  methods: {
    isToday (day) {
      return day === this.today.dd && this.currentDate.yyyy === this.today.yyyy && this.currentDate.mm === this.today.mm
    },
    isActiveDay (day) {
      return this.valueObj && (day === this.valueObj.dd && this.currentDate.yyyy === this.valueObj.yyyy && this.currentDate.mm === this.valueObj.mm)
    },
    isActiveTime (t) {
      return this.valueObj && `${normalize(this.valueObj.hh)}:${normalize(this.valueObj.mi)}` === t
    },
    selectTime (t) {
      this.bus.$emit('dropdown.hide')

      var [hh, mi] = t.split(':').map(v => +v)
      var {yyyy, mm, dd} = this.valueObj ? this.valueObj : this.today

      var nval = formatDate({yyyy, mm, dd, hh, mi}, true)
      this.$emit('input', nval)
      this.$emit('change', nval)
      this.controlBus && this.controlBus.$emit('control.check', nval)
    },
    selectDate (day) {
      if (!day) {
        return
      }
      if (!this.hastime) {
        this.bus.$emit('dropdown.hide')
      }

      var hour = this.valueObj ? this.valueObj.hh : 0
      var minute = this.valueObj ? this.valueObj.mm : 0
      var target = Object.assign({}, this.currentDate)
      target.dd = day
      target.hh = hour
      target.mi = minute

      var nval = formatDate(target, this.hastime)
      this.$emit('input', nval)
      this.$emit('change', nval)
      this.controlBus && this.controlBus.$emit('control.check', nval)
    },
    prevYear () {
      this.currentDate.yyyy--
    },
    prevMonth () {
      var month = this.currentDate.mm
      var year = this.currentDate.yyyy

      month--
      if (month <= 0) {
        month = 12
        year--
      }

      this.currentDate.mm = month
      this.currentDate.yyyy = year
    },
    nextMonth () {
      var month = this.currentDate.mm
      var year = this.currentDate.yyyy

      month++
      if (month > 12) {
        month = 1
        year++
      }

      this.currentDate.mm = month
      this.currentDate.yyyy = year
    },
    nextYear () {
      this.currentDate.yyyy++
    },
    prevTimes () {
      this.bus.$emit('scroll.run', 'y', '-100%')
    },
    nextTimes () {
      this.bus.$emit('scroll.run', 'y', '+100%')
    }
  }
}

function parseDate (value) {
  var fields = ['yyyy', 'mm', 'dd', 'hh', 'mi']
  var result = null
  if (!value) {
    let date = new Date()
    value = `${normalize(date.getFullYear())}-${normalize(date.getMonth() + 1)}-${normalize(date.getDate())} ${normalize(date.getHours())}:${normalize(date.getMinutes())}`
  }

  // 从时间字符串中找出年、月、日、时及分的数据
  var format = 'yyyy-mm-dd hh:mi'
  let formatSegs = format.split(/[-: ]/)
  let valSegs = value.split(/[-: ]/)
  result = fields.reduce((res, f) => {
    var idx = formatSegs.indexOf(f)
    if (idx !== -1) {
      res[f] = +valSegs[idx]
    }
    return res
  }, {})

  return result
}

function formatDate (date, hastime) {
  var dateStr = `${date.yyyy}-${normalize(date.mm)}-${normalize(date.dd)}`
  var timeStr = hastime ? ` ${normalize(date.hh)}:${normalize(date.mi)}` : ''
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
@import (reference) "../styles/color.less";

.km-dropdown.km-datime {
  display: inline-block;
  position: relative;
  background: #fff;
  color: @dark;
  font-size: 14px;
  line-height: normal;
  cursor: default;

  .km-dropdown-frame {
    width: 267px;
  }

  &.km_date_time .km-dropdown-frame {
    width: 342px;
  }

  &.km_date_time .km_date {
    border-right: 1px dashed @border-light;
  }
  .km_date {
    position: relative;
    width: 265px;

    ul.km_date_head {
      border-bottom: 1px dashed @border-light;
      font-size: 18px;

      li {
        height: 60px;
        line-height: 60px;

        &.km_date_prev {
          padding-left: 15px;
        }
        &.km_date_next {
          padding-right: 15px;
        }

        &.km_date_yymm {
          margin: 0 auto;
          width: 150px;
          text-align: center;
        }
      }
    }

    table.km_date_body {
      width: 100%;
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

          &:hover:not(:empty):not(.km_date_active) {
            border-radius: 18px;
            background: @bg-light;
          }
          &.km_date_active {
            border-radius: 18px;
            background: @primary;
            color: #fff;
          }

          &.km_date_today {
            position: relative;
            &.km_date_active:after {
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

  .km_time {
    width: 75px;
    height: 100%;
    text-align: center;

    .km_time_prev,
    .km_time_next {
      height: 36px;
      line-height: 36px;
    }

    .km_time_list {
      li {
        height: 30px;
        line-height: 30px;

        &.km_time_active {
          color: @primary;
        }
        &:hover:not(.km_time_active) {
          background: @bg-light;
        }
      }
    }

    .km-scroll {
      height: 180px;
    }
  }
}
</style>
