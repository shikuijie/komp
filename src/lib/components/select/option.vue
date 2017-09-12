<template>
<li class="km-option" @click.stop="select" @mouseleave.stop="moveOut" @mouseenter.stop="moveIn">
  <slot :option="option" :leaf="leaf" :active="active" :onpath="onpath">
    <div class="km-option-label" :class="{km_option_active: active}">
      <checkbox v-if="multiple" :value="active" :nostop="true">
      </checkbox><span>{{label}}</span>
    </div>
  </slot>
  <i class="km-option-caret" v-if="onpath && !leaf"></i>
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
    moveIn () {
      this.mTimeHandler = window.setTimeout(() => {
        this.bus.$emit('option.hover', this.option)
      }, 350)
    },
    moveOut () {
      if (this.mTimeHandler) {
        window.clearTimeout(this.mTimeHandler)
        this.mTimeHandler = null
      }
    }
  }
}
</script>

