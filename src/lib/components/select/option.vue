<template>
<li class="km-option" v-if="multiple" :level="level">
  <km-checkbox v-model="selectValue" :onvalue="value" :label="label"></km-checkbox>
</li>
<li class="km-option" @click.stop="select" :level="level" v-else>{{label}}</li>
</template>

<script>
import Bus from '../../bus'
export default {
  name: 'km-option',
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
  created () {
    this.selectOptions[this.value] = this.label
    if (!this.multiple && this.value === this.selectValue) {
      this.selectBus.$emit('select', this.value)
    }
    if (this.groupOptions) {
      this.groupOptions[this.value] = this.label
    }
  },
  methods: {
    select () {
      // 通知 Dropdown 组件
      this.selectBus.$emit('hide')
      // 通知 Select 组件
      this.selectBus.$emit('select', this.value)
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
