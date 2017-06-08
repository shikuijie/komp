<template>
  <li class="af-option" v-if="multiple">
    <af-checkbox v-model="values" :true-value="value" :label="label" @change="bus && bus.$emit('check')"></af-checkbox>
  </li>
  <li v-else class="af-option" v-text="label" @click.stop="select" :class="{_af_option_selected: selected.value === value}"></li>
</template>
<script>
  import Bus from 'ui/bus'

  export default {
    name: 'select-option',
    props: {
      selected: {
        type: Object,
        default () {
          return {}
        }
      },
      value: {
        type: null,
        required: true
      },
      label: String | Number,
      multiple: Boolean,
      values: Array,
      bus: Bus
    },
    mounted () {
      if (this.selected && this.selected.value === this.value) {
        this.selected.label = this.label || this.value
      }
    },
    watch: {
      'selected.value' (val) {
        if (val === this.value) {
          this.selected.label = this.label || this.value
        }
      }
    },
    methods: {
      select () {
        this.$emit('__afSelect', this.value)
      }
    }
  }
</script>