<script>
import {getProps} from '../../vnode'
import {getHead, getRow, getMRow, getFoot, getWrappers} from './tool'

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
    wrappers: Array
  },
  render (h) {
    var wrappers = this.wrappers || getWrappers(this.$slots.default)
    var columns = wrappers ? wrappers[wrappers.length - 1].map(wrapper => wrapper.node) : []
    var bodyKeys = this.rowspan ? columns.map(s => getProps(s).body) : null

    return h('table', {
      staticClass: 'km-table'
    }, [
      getHead(h, wrappers, this.table.thead),
      h('tbody', this.rowspan ? (this.table.tbody.reduce((res, row) => {
        return res.concat(getMRow(h, columns, bodyKeys, row))
      }, [])) : this.table.tbody.map(row => getRow(h, columns, row))),
      this.table.tfoot ? getFoot(h, columns, this.table.tfoot) : ''
    ])
  }
}
</script>

<style lang="less">
@import (reference) "../../styles/color.less";

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
