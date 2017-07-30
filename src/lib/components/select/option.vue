<template>
<li class="km-option" @click.stop="select" @mouseenter.stop="hover">
  <slot :option="option" :leaf="leaf" :active="active" :onpath="onpath">
    <div class="km-option-label">
      <i class="km_option_circle" v-if="active && !multiple">
      </i><checkbox v-if="multiple" :value="active" :nostop="true">
      </checkbox><span>{{label}}
      </span><i class="km_option_triangle" v-if="onpath && !leaf"></i>
    </div>
  </slot>
</li>
</template>

<script>
import Bus from 'lib/bus'
import Checkbox from 'komp/checkbox.vue'

export default {
  components: {
    Checkbox
  },
  props: {
    bus: Bus,
    option: Object,
    label: String,
    value: null,
    leaf: Boolean,
    active: Boolean,
    onpath: Boolean,
    multiple: Boolean,
    cascaded: Boolean
  },
  methods: {
    select () {
      this.bus.$emit('option.select', this.option)
    },
    hover () {
      this.bus.$emit('option.hover', this.option)
    }
  }
}
</script>

