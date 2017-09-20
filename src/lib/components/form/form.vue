<script>
import {getProps, hasListener} from 'lib/vnode'
import Bus from 'lib/bus'

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
    this.mHasSubmitEvent = !!hasListener(this.$vnode, 'submit')
    this.mHasInvalidEvent = !!hasListener(this.$vnode, 'invalid')
    // 收集 control 的错误信息
    this.bus.$on('form.check', () => {
      var checkers = this.bus.$emit('form.inner.check')
      return Promise.all(Array.isArray(checkers) ? checkers : [checkers]).then(errors => {
        errors = errors.filter(_ => _.error)
        return errors.length ? errors : null
      })
    })

    this.bus.$on('form.submit', () => {
      return new Promise(resolve => {
        this.bus.$emit('form.check').then(errors => {
          this.$emit('submit', {resolve, errors})
        })
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
