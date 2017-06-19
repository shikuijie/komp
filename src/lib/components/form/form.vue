<script>
import {getProps} from '../../vnode'
import Bus from '../../bus'

export default {
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    }
  },
  created () {
    // 收集 control 的错误信息
    this.bus.$on('form.submit', () => {
      var checkers = this.bus.$emit('form.inner.check')
      return Promise.all(Array.isArray(checkers) ? checkers : [checkers]).then(errors => {
        if (errors.every(_ => !_)) {
          return new Promise(resolve => {
            this.$emit('submit', resolve)
          })
        }
      })
    })

    this.bus.$on('form.reset', () => {
      this.bus.$emit('form.inner.clear')
      this.$emit('reset')
    })
  },
  destroyed () {
    this.bus.$off('form.submit')
    this.bus.$off('form.reset')
  },
  render (h) {
    var self = this
    var slots = this.$slots.default || []
    slots.forEach(function recr (slot) {
      if (slot.tag && /km-form-(?:control|action)/.test(slot.tag)) {
        let props = getProps(slot)
        props.formBus = self.bus
      } else if (slot.children) {
        slot.children.forEach(recr)
      }
    })

    return h('div', {
      staticClass: 'km-form'
    }, slots)
  }
}
</script>

<style lang="less">
.km-form {
  &.km-inline {
    > * {
      display: inline-block;
      vertical-align: middle;
    }
  }
}
</style>