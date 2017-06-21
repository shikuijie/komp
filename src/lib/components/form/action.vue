<script>
import {getAttrs} from '../../vnode'
import Bus from '../../bus'

export default {
  name: 'km-form-action',
  props: {
    formBus: Bus
  },
  data () {
    return {
      submitting: false
    }
  },
  render (h) {
    var self = this
    var slots = this.$slots.default || []
    slots.forEach(function recr (slot) {
      var attrs = getAttrs(slot)
      if (['submit', 'reset'].indexOf(attrs.type) !== -1) {
        let on = slot.data.on = slot.data.on || {}
        if (attrs.type === 'submit') {
          let classObj = slot.data.class = slot.data.class || {}
          classObj['km-disabled'] = self.submitting

          on.click = event => {
            event.stopPropagation()
            event.preventDefault()

            // 防止重复提交表单
            if (self.submitting) {
              return
            }

            self.submitting = true
            self.formBus.$emit('form.submit').then(() => {
              self.submitting = false
            })
          }
        } else {
          on.click = event => {
            event.stopPropagation()
            event.preventDefault()
            self.formBus.$emit('form.reset')
          }
        }
      } else if (slot.children) {
        slot.children.forEach(recr)
      }
    })

    return h('div', {
      staticClass: 'km-form-action'
    }, slots)
  }
}
</script>
