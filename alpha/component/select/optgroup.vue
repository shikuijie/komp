<template>
  <li class="af-optgroup">
    <ul v-if="multiple" class="clearfix">
      <li @click="onCheck" class="_af_optgroup_label">
        <af-checkbox :value="checked" :label="label" @change="bus && bus.$emit('check')"></af-checkbox>
      </li>
      <slot></slot>
    </ul>
    <ul v-else>
      <li class="_af_optgroup_label" v-text="label"></li>
      <slot></slot>
    </ul>
  </li>
</template>
<script>
  import afCheckbox from '../checkbox.vue'
  import Bus from 'ui/bus'

  export default {
    name: 'select-optgroup',
    components: {
      afCheckbox
    },
    props: {
      label: {
        type: String,
        requried: true
      },
      multiple: Boolean,
      values: Array,
      groupValues: Array,
      bus: Bus
    },
    computed: {
      checked () {
        return this.values && this.groupValues.every(v => this.values.indexOf(v) !== -1)
      }
    },
    methods: {
      onCheck () {
        var val = !this.checked
        if (val) {
          this.groupValues.forEach(v => {
            if (this.values.indexOf(v) === -1) {
              this.values.push(v)
            }
          })
        } else {
          this.groupValues.forEach(v => {
            this.values.splice(this.values.indexOf(v), 1)
          })
        }
      }
    }
  }
</script>