<template>
<span :is="type === 'body' ? 'td' : 'th'">
  <slot :row="row" :name="type">{{content}}</slot>
</span>
</template>

<script>
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
    content () {
      var field = this[this.type]
      return parseExpr(field, this.row) || field
    }
  }
}

function parseExpr (expr, ctx) {
  try {
    /*eslint-disable */
    return new Function('ctx', `with(ctx) { return ${expr} }`)(ctx)
    /*eslint-disable */
  } catch (e) {
  }
}
</script>
