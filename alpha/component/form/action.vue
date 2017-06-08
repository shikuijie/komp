<script>
  import {getVnodeAttrs, isUndefined, isString} from '../util'
  import Bus from '../bus'

  export default {
    name: 'form-action',
    props: {
      __afErrors: Object,
      __afFormBus: Bus,
      realtime: {
        type: String,
        validator (val) {
          return isUndefined(val) || !val
        }
      }
    },
    render (h) {
      var slots = this.$slots.default
      if (!slots) {
        throw new Error('no button inside of form-action')
      }

      slots.reduce((res, s) => {
        if (!s.tag) {
          return res
        }
        var attrs = getVnodeAttrs(s)
        if (attrs.type === 'submit') {
          if (isString(this.realtime)) {
            let btnCls = s.data.class = s.data.class || {}
            btnCls['af-disabled'] = this.__afErrors.__afHasError
          }

          let on = s.data.on = s.data.on || {}
          let click = on.click
          on.click = $event => {
            $event.preventDefault()
            $event.stopPropagation()

            this.__afFormBus.$emit('submit')
            if (!this.__afErrors.__afHasError) {
              click && click($event)
            }
          }
        } else if (attrs.type === 'reset') {
          let on = s.data.on = s.data.on || {}
          let click = on.click
          on.click = $event => {
            $event.preventDefault()
            $event.stopPropagation()

            this.__afFormBus.$emit('reset')
            click && click($event)
          }
        }
      }, [])

      return h('div', {
        staticClass: 'af-form-action'
      }, slots)
    }
  }
</script>