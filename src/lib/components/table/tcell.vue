<template>
<div :is="tag" class="km-tcell">
  <slot :row="row" :table="table" :name="type">{{content}}</slot>
</div>
</template>

<script>
import {parseExpr, Type} from 'lib/util'

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
    table: Object,
    head: String,
    foot: Function | String,
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
      if (this.type === 'foot' && Type.isFunction(field)) {
        return field(this.table.tbody.reduce((res, row) => {
          collect(row, this.body, res)
          return res
        }, []), this.row)
      }
      return parseExpr(field, this.row) || field

      function collect (obj, f, res) {
        var i = f.indexOf('[]')
        if (i !== -1) {
          var arr = parseExpr(f.slice(0, i), obj)
          arr && arr.forEach(item => collect(item, f.slice(i + 2), res))
        } else {
          res.push(f ? parseExpr(f, obj) : obj)
        }
      }
    }
  }
}
</script>
