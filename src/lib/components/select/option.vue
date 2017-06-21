<template>
<li class="km-option" v-if="multiple" :level="level" @click.stop="toggleSwitch">
  <km-checkbox :bus="checkboxBus" v-model="selectValue" :onvalue="value"></km-checkbox>
  <slot>{{label}}</slot>
</li>
<li class="km-option" @click.stop="select" :level="level" v-else>
  <slot>{{label}}</slot>
</li>
</template>

<script>
import Bus from '../../bus'
export default {
  name: 'km-select-option',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      required: true
    },
    selectBus: Bus,
    // 收集所有 Option 的（label, value)
    selectOptions: Object,
    // Select 组件的 model 值
    selectValue: null,
    multiple: Boolean,
    // 多选下拉框用来收集同组的 (label, value)
    groupOptions: Object,
    // 嵌套深度
    level: Number
  },
  data () {
    return {
      checkboxBus: this.multiple ? new Bus() : null
    }
  },
  created () {
    this.selectOptions[this.value] = this.label
    if (this.groupOptions) {
      this.groupOptions[this.value] = this.label
    }
  },
  methods: {
    select () {
      // 通知 Dropdown 组件
      this.selectBus.$emit('dropdown.hide')
      // 通知 Select 组件
      this.selectBus.$emit('select.change', this.value)
    },
    toggleSwitch () {
      // 翻转 Checkbox 状态
      this.checkboxBus.$emit('toggle')
    }
  },
  destroyed () {
    delete this.selectOptions[this.value]
    if (this.groupOptions) {
      delete this.groupOptions[this.value]
    }
  }
}
</script>
