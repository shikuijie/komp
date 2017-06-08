<template>
  <div class="af-triangle" :class="`_af_triangle_${direction}`">
    <div class="_af_triangle_square"></div>
  </div>
</template>
<script>
  export default {
    props: {
      direction: {
        type: String,
        default: 'down'
      }
    }
  }
</script>
<style lang="less">
  @import (reference) '../style/variable.less';

  .af-triangle {
    position: absolute;
    left: 0;
    top: 0;
    width: 14.2px;
    height: 7.1px;
    overflow: hidden;

    &._af_triangle_left,
    &._af_triangle_right {
      width: 7.1px;
      height: 14.2px;
    }

    ._af_triangle_square {
      position: relative;
      left: 2px;
      top: 2px;
      width: 10px;
      height: 10px;
      border: 1px solid @border-light;
      background: white;
      transform: rotateZ(45deg);
    }
    &._af_triangle_up ._af_triangle_square {
      left: 2px;
      top: -5px;
    }
    &._af_triangle_left ._af_triangle_square {
      left: -5px;
      top: 2px;
    }
    &._af_triangle_right ._af_triangle_square {
      left: 2px;
      top: 2px;
    }
  }
</style>