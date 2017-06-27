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
      loading: null
    }
  },
  render (h) {
    return h(this.tag, {
      staticClass: 'km-modal-anchor',
      on: {
        click: event => {
          event.stopPropagation()
          this.bus.$emit('modal.toggle', this.eid, this.edata)
        }
      }
    }, this.$slots.default)
  },
  created () {
    var map = this.bus.mCtxMap = this.bus.mCtxMap || new Map()
    if (map.get(this.eid)) {
      throw new Error('Modal Anchor EID corresponds to more than one Anchor Components')
    }
    map.set(this.eid, this)
  },
  destroyed () {
    var map = this.bus.mCtxMap
    map.delete(this.eid)
  }
}
</script>
