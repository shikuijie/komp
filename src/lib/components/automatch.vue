<template>
<Dropdown class="km-automatch"></Dropdown>
</template>

<script>
import Bus from '../bus'

export default {
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    }
  }
}
</script>

<style lang="less">
.km-automatch {}
</style>
