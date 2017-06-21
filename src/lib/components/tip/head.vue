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
      required: true
    },
    edata: Object
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
          this.bus.$emit('tip.hide')
        }
      }
    }

    return h(this.tag, {
      staticClass: 'km-tip-head',
      on: handler[this.trigger]
    }, this.$slots.default)
  },
  created () {
    this.eid.mCtx = this
  }
}
</script>
