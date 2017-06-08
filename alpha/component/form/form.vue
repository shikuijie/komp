<script>
  import {getVnodeProps, hasVnodeListener} from '../util'
  import Bus from '../bus'

  export default {
    name: 'form',
    props: {
      bus: {
        type: Bus,
        default () {
          return new Bus()
        }
      }
    },
    data () {
      return {
        errors: {
          __afHasError: false
        }
      }
    },
    created () {
      this.__afDeleteId = this.bus.$on('delete', name => {
        console.log('control', name)
        delete this.errors[`${name}`]
        this.errors.__afHasError = !!Object.keys(this.errors).find(k => k.indexOf('__af') === -1 && this.errors[k])
      })
      this.__afSubmitId = this.bus.$on('submit', () => {
        if (this.errors.__afHasError) {
          this.bus.$emit('__afShowError')
        } else if (this.__afSubmitHandler) {
          this.$emit('submit')
        }
      })
      this.__afResetId = this.bus.$on('reset', () => {
        this.bus.$emit('__afHideError')
        if (this.__afResetHandler) {
          this.$emit('reset')
        }
      })
      this.bus.$on('check', () => {
        if (this.errors.__afHasError) {
          this.bus.$emit('__afShowError')
          return false
        }
        return true
      })
    },
    destroyed () {
      this.bus.$off('delete', this.__afDeleteId)
      this.bus.$off('submit', this.__afSubmitId)
      this.bus.$off('reset', this.__afResetId)
    },
    mounted () {
      this.__afSubmitHandler = hasVnodeListener(this.$vnode, 'submit')
      this.__afResetHandler = hasVnodeListener(this.$vnode, 'reset')
    },
    methods: {
      slots () {
        if (!this.$slots.default) {
          return
        }

        var self = this
        return this.$slots.default.reduce(function step (res, s) {
          if (s.tag) {
            let match = s.tag.match(/form-(control|action)/)
            if (match) {
              let props = getVnodeProps(s)
              props.__afFormBus = self.bus
              props.__afErrors = self.errors
            } else if (s.children) {
              s.children = s.children.reduce(step, [])
            }
          }

          if (s.tag || s.text) {
            res.push(s)
          }
          return res
        }, [])
      }
    },
    render (h) {
      return h('div', {
        staticClass: 'af-form'
      }, this.slots())
    }
  }
</script>
<style lang="less">
  .af-form.af-inline {
    .af-form-control {
      display: inline-block;

      .af-form-control-label {
        display: inline-block;
        text-align: center;
        vertical-align: middle;
      }
      .af-form-control-input {
        display: inline-block;
        vertical-align: middle;
      }
    }

    .af-form-action {
      display: inline-block;
    }
  }
</style>