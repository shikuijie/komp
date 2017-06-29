<script>
import kmTable from './table.vue'
import Scroll from '../scroll.vue'
import {getWrappers} from './tool'
import {cloneVnode} from '../../vnode'

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
    }
  },
  data () {
    return {
      scrollable: true
    }
  },
  computed: {
    fixFirstCol () {
      return ['first', 'both'].indexOf(this.fixed) !== -1
    },
    fixLastCol () {
      return ['last', 'both'].indexOf(this.fixed) !== -1
    }
  },
  mounted () {
    this.scrollable = this.bus.$emit('scroll.scrollable')
  },
  render (h) {
    var wrappers = getWrappers(this.$slots.default)

    return h('div', {
      staticClass: 'km-table-fixcol'
    }, [
      h(Scroll, [
        h(kmTable, {
          staticClass: 'km-table-middle',
          props: {
            table: this.table,
            wrappers: wrappers
          }
        })
      ]),
      this.fixFirstCol ? h(kmTable, {
        staticClass: 'km-table-first',
        props: {
          table: this.table,
          wrappers: wrappers.map(row => {
            var item = row[0]
            return [{
              render: item.render,
              node: cloneVnode(item.node)
            }]
          })
        }
      }) : '',
      this.fixLastCol ? h(kmTable, {
        staticClass: 'km-table-last',
        props: {
          table: this.table,
          wrappers: wrappers.map(row => {
            var item = row[row.length - 1]
            return [{
              render: item.render,
              node: cloneVnode(item.node)
            }]
          })
        }
      }) : ''
    ])
  }
}
</script>

<style lang="less">
@import (reference) "../../styles/color.less";

.km-table-fixcol {
  position: relative;
  overflow: hidden;

  .km-scroll {
    width: 100%;
  }

  .km-table-first {
    position: absolute;
    left: 0;
    top: 0;
    min-width: 0;
    background: #fff;
    box-shadow: 3px 0 5px @border-slight;
  }

  .km-table-last {
    position: absolute;
    right: 0;
    top: 0;
    min-width: 0;
    background: #fff;
    box-shadow: -3px 0 5px @border-slight;
  }
}
</style>