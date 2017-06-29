<script>
import Bus from '../../bus'

export default {
  props: {
    bus: {
      type: Bus,
      required: true
    },
    tag: {
      type: String,
      default: 'span'
    },
    position: {
      type: String,
      validator (val) {
        return ['left', 'right', 'top', 'bottom'].indexOf(val) !== -1
      },
      default: 'bottom'
    },
    trigger: {
      type: String,
      validator (val) {
        return val === 'hover' || val === 'click'
      },
      default: 'click'
    },
    eid: {
      type: Object,
      default () {
        return {}
      }
    },
    edata: Object
  },
  data () {
    return {
      // Ship 打开时，可能需要通过异步请求来准备其数据
      // null 表示 Ship 的数据需要从头通过异步请求来准备
      // false 表示 Ship 的数据已经准备好了
      // true 表示 Ship 的数据正在准备中
      loading: null 
    }
  },
  render (h) {
    var handler = {
      click: {
        click: event => {
          event.stopPropagation()
          this.bus.$emit('tip.toggle', this.eid, this.edata)
        }
      },
      hover: {
        mouseenter: event => {
          event.stopPropagation()
          this.bus.$emit('tip.show', this.eid, this.edata)
        },
        mouseleave: event => {
          event.stopPropagation()
          this.bus.$emit('tip.hide', this.eid, this.edata)
        }
      }
    }

    return h(this.tag, {
      staticClass: 'km-tip-anchor',
      on: handler[this.trigger]
    }, this.$slots.default)
  },
  created () {
    // map: eid -> this
    // 可以通过 eid 找到 Anchor 的 Vue 实例
    var map = this.bus.mCtxMap = this.bus.mCtxMap || new Map()
    if (map.get(this.eid)) {
      throw new Error('Tip Anchor EID corresponds to more than one Anchor Components')
    }
    map.set(this.eid, this)
  },
  destroyed () {
    var map = this.bus.mCtxMap
    map.delete(this.eid)
  }
}
</script>
