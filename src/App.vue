<template>
  <div id="app">
    <km-select :bus="bus1" :expandable="true" :multiple="true" :clearable="true" v-model="select1" style="width: 320px">
      <km-optgroup label="组1">
        <km-option label="Label1" value="Value1"></km-option>
        <km-option label="Label2" value="Value2"></km-option>
      </km-optgroup>
      <km-optgroup label="组2">
        <km-option label="Label3" value="Value3"></km-option>
        <km-option label="Label4" value="Value4"></km-option>
      </km-optgroup>
    </km-select>
    <km-select :bus="bus" :clearable="true" :expandable="true" v-model="select">
      <km-optgroup label="组1">
        <km-option label="Label1" value="Value1"></km-option>
        <km-option label="Label2" value="Value2"></km-option>
      </km-optgroup>
      <km-optgroup label="组2">
        <km-option label="Label3" value="Value3"></km-option>
        <km-option label="Label4" value="Value4"></km-option>
      </km-optgroup>
    </km-select>
    <button @click.stop="bus.$emit('hide')">Toggle</button>
    <km-scroll :bus="scrollBus" :hidden="false" style="max-width: 200px;max-height: 280px">
      <div style="width: 320px">
        <div v-show="visible">
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd1</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd2</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd3</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd4</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd5</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd6</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd7</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd8</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd9</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd10</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd11</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd12</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd13</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd14</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd15</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd16</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd17</div>
          <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd18</div>
        </div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd19</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd20</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd21</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd22</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd23</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd24</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd25</div>
        <div>我饿if顺利的会计法沙拉酱豆腐沃尔夫老师发的就是fd26</div>
      </div>
    </km-scroll>
    <button @click.stop="scroll('-100%')">上翻</button>
    <button @click.stop="scroll('+100%')">下翻</button>
    <button @click.stop="toggle">翻转</button>
  </div>
</template>

<script>
import Vue from 'vue'
import {Bus} from 'komp'

export default {
  data () {
    return {
      select: 'Value1',
      bus: new Bus(),
      select1: ['Value1', 'Value2', 'Value3', 'Value4'],
      bus1: new Bus(),
      scrollBus: new Bus(),
      visible: true
    }
  },
  methods: {
    scroll (size) {
      this.scrollBus.$emit('scroll', 'y', size)
    },
    toggle () {
      this.visible = !this.visible
      Vue.nextTick(() => {
        this.scrollBus.$emit('reset', 'y')
      })
    }
  }
}
</script>

