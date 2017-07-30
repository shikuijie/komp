<template>
<div :is="tag" class="km-tcell">
  <slot :row="row" :name="type">{{content}}</slot>
</div>
</template>

<script>
import {parseExpr} from 'lib/util'

export default {
  props: {
    type: {
      type: String,
      validator (val) {
        return val === 'head' || val === 'body' || val === 'foot'
      }
    },
    row: {
      type: Object,
      default () {
        return {}
      }
    },
    head: String,
    foot: String,
    body: String
  },
  computed: {
    tag () {
      // thead 中每个单元格 th 里面还有一层 div
      // 这个主要是为了保证每一列通过样式设置的宽度有效
      if (this.type === 'head') {
        return 'div'
      } else if (this.type === 'body') {
        return 'td'
      } else {
        return 'th'
      }
    },
    content () {
      var field = this[this.type]
      return parseExpr(field, this.row) || field
    }
  }
}
</script>
