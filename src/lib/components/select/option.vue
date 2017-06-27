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
    selectOptions: Array,
    // Select 组件的 model 值
    selectValue: null,
    multiple: Boolean,
    // 多选下拉框用来收集同组的 (label, value)
    groupOptions: Array,
    // 嵌套深度
    level: Number
  },
  data () {
    return {
      checkboxBus: this.multiple ? new Bus() : null
    }
  },
  created () {
    this.mOption = {label: this.label, value: this.value}
    this.selectOptions.push(this.mOption)
    if (this.groupOptions) {
      this.groupOptions.push(this.mOption)
    }
  },
  methods: {
    select () {
      this.selectBus.$emit('select.change', this.value)
    },
    toggleSwitch () {
      this.checkboxBus.$emit('toggle')
    }
  },
  destroyed () {
    this.selectOptions.splice(this.selectOptions.indexOf(this.mOption), 1)
    if (this.groupOptions) {
      this.groupOptions.splice(this.groupOptions.indexOf(this.mOption), 1)
    }
  }
}
</script>
