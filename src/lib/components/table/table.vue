<script>
import {getProps} from 'lib/vnode'
import {getHead, getRow, getMRow, getFoot, getWrappers} from './util'

export default {
  props: {
    table: {
      required: true,
      thead: Object,
      tbody: {
        type: Array,
        required: true
      },
      tfoot: Object
    },
    rowspan: Boolean,
    wrappers: Array,
    bodyKeys: Array,
    // 只显示哪一列
    col: Number
  },
  render (h) {
    var wrappers = this.wrappers || getWrappers(this.$slots.default)
    var columns = this.columns || (wrappers ? wrappers[wrappers.length - 1].map(wrapper => wrapper.node) : [])
    var bodyKeys = this.bodyKeys || (this.rowspan ? (this.bodyKeys || columns.map(s => getProps(s).body)) : null)
    var hasFoot = !!columns.filter(s => getProps(s).foot).length

    return h('table', {
      staticClass: 'km-table'
    }, [
      getHead(h, wrappers, this.table.thead, this.table, this.col),
      h('tbody', this.rowspan ? (this.table.tbody.reduce((res, row) => {
        return res.concat(getMRow(h, columns, bodyKeys, row, this.table, this.col))
      }, [])) : this.table.tbody.map(row => getRow(h, columns, row, this.table, this.col))),
      hasFoot ? getFoot(h, columns, this.table.tfoot, this.table, this.col) : ''
    ])
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";

.km-bordered .km-table,
.km-table.km-bordered {
  min-width: 100%;
  border-collapse: collapse;

  th, td {
    border: 1px solid @border-light;
  }
}

.km-table {
  table-layout: fixed;
  text-align: left;
}
</style>
