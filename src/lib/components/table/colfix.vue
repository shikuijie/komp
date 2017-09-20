<script>
import kmTable from './table.vue'
import Scroll from 'komp/scroll.vue'
import Bus from 'lib/bus'
import {getWrappers, getMRow} from './util'
import {cloneVnode, getProps} from 'lib/vnode'

export default {
  components: {
    kmTable,
    Scroll
  },
  props: {
    table: Object,
    fixed: {
      type: String,
      validator (val) {
        return ['first', 'last', 'both'].indexOf(val) !== -1
      }
    },
    rowspan: Boolean
  },
  data () {
    return {
      scrollable: true,
      bus: new Bus()
    }
  },
  computed: {
    fixFirstCol () {
      return this.scrollable && ['first', 'both'].indexOf(this.fixed) !== -1
    },
    fixLastCol () {
      return this.scrollable && ['last', 'both'].indexOf(this.fixed) !== -1
    }
  },
  mounted () {
    this.scrollable = this.bus.$emit('scroll.scrollable', 'x')
  },
  render (h) {
    var wrappers = getWrappers(this.$slots.default)
    var columns = wrappers ? wrappers[wrappers.length - 1].map(wrapper => wrapper.node) : []
    var bodyKeys = this.rowspan ? columns.map(s => getProps(s).body) : null

    return h('div', {
      staticClass: 'km-colfix-table'
    }, [
      h(Scroll, {
        props: {
          bus: this.bus 
        }
      }, [
        h(kmTable, {
          staticClass: 'km-table-middle',
          props: {
            table: this.table,
            rowspan: this.rowspan,
            wrappers,
            columns,
            bodyKeys
          }
        })
      ]),
      this.fixFirstCol ? h(kmTable, {
        staticClass: 'km-table-first',
        props: {
          table: this.table,
          rowspan: this.rowspan,
          wrappers,
          columns,
          bodyKeys,
          col: 0
        }
      }) : '',
      this.fixLastCol ? h(kmTable, {
        staticClass: 'km-table-last',
        props: {
          table: this.table,
          rowspan: this.rowspan,
          wrappers,
          columns,
          bodyKeys,
          col: columns.length - 1
        }
      }) : ''
    ])
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";

.km-colfix-table {
  position: relative;
  overflow: hidden;

  .km-scroll {
    width: 100%;
  }

  .km-table.km-table-first {
    position: absolute;
    left: 0;
    top: 0;
    min-width: 0;
    background: #fff;
    box-shadow: 3px 0 5px @border-slight;
  }

  .km-table.km-table-last {
    position: absolute;
    right: 0;
    top: 0;
    min-width: 0;
    background: #fff;
    box-shadow: -3px 0 5px @border-slight;
  }
}
</style>