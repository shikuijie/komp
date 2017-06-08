<script>
  import {hasVnodeListener, getVnodeProps, getVnodeData, isUndefined, isString, isNumber} from '../util'
  import Bus from '../bus'

  export default {
    name: 'form-control',
    props: {
      name: String,
      __afErrors: Object,
      __afFormBus: Bus,
      bus: {
        type: Bus,
        default () {
          return new Bus()
        }
      },

      // 表单校验类型
      required: String,
      number: String,
      maxlength: Number | Array,
      min: Number | String | Array,
      max: Number | String | Array,
      url: String,
      phone: String,
      email: String,
      pattern: RegExp | Array
    },
    data () {
      return {
        error: null,
        showError: false
      }
    },
    created () {
      if (this.__afFormBus && !this.name) {
        throw new Error('must provide "name" attribute for form-control inside of form')
      }
      if (this.__afFormBus) {
        this.__af_formHideId = this.__afFormBus.$on('__afHideError', () => {
          this.showError = false
        })
        this.__af_formShowId = this.__afFormBus.$on('__afShowError', () => {
          this.showError = true
        })
      }

      this.__af_checkId = this.bus.$on('__afCheck', val => {
        this.check(val)
      })
      this.__af_showId = this.bus.$on('__afShowError', () => {
        this.showError = true
      })
      this.__afResetId = this.bus.$on('reset', () => {
        this.showError = false
      })
      this.__afCheckId = this.bus.$on('check', () => {
        return this.bus.$emit('__afGetValue', val => {
          return this.check(val).then((msg) => {
            this.showError = true
            return msg
          })
        })
      })
    },
    destroyed () {
      if (this.__afFormBus) {
        this.__afFormBus.$off('__afHideError', this.__af_formHideId)
        this.__afFormBus.$off('__afShowError', this.__af_formShowId)
      }
      this.bus.$off('__afCheck', this.__af_checkId)
      this.bus.$off('__afShowError', this.__af_showId)
      this.bus.$off('reset', this.__afResetId)
      this.bus.$off('check', this.__afCheckId)
    },
    computed: {
      requiredInfo () {
        if (isUndefined(this.required)) {
          return
        }

        if (this.required) {
          return {
            msg: this.required
          }
        } else {
          return {
            msg: '必填项！'
          }
        }
      },
      numberInfo () {
        if (isUndefined(this.number)) {
          return
        }

        if (isString(this.number)) {
          if (this.number) {
            return {
              msg: this.number
            }
          } else {
            return {
              msg: '数字格式不正确'
            }
          }
        }
      },
      maxlengthInfo () {
        if (isUndefined(this.maxlength)) {
          return
        }

        if (Array.isArray(this.maxlength)) {
          return {
            msg: this.maxlength[1],
            value: this.maxlength[0]
          }
        } else {
          return {
            msg: `不能超过${this.maxlength}个字符`,
            value: this.maxlength
          }
        }
      },
      minInfo () {
        if (isUndefined(this.min)) {
          return
        }

        if (Array.isArray(this.min)) {
          return {
            msg: this.min[1],
            value: this.min[0]
          }
        } else {
          return {
            msg: `不能低于${this.min}`,
            value: this.min
          }
        }
      },
      maxInfo () {
        if (isUndefined(this.max)) {
          return
        }

        if (Array.isArray(this.max)) {
          return {
            msg: this.max[1],
            value: this.max[0]
          }
        } else {
          return {
            msg: `不能超过${this.max}`,
            value: this.max
          }
        }
      },
      emailInfo () {
        if (isUndefined(this.email)) {
          return
        }

        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (this.email) {
          return {
            msg: this.email,
            value: re
          }
        } else {
          return {
            msg: '邮箱格式不正确！',
            value: re
          }
        }
      },
      urlInfo () {
        if (isUndefined(this.url)) {
          return
        }

        var re = /^(?:https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})$/
        if (this.url) {
          return {
            msg: this.url,
            value: re
          }
        } else {
          return {
            msg: 'URL格式不正确',
            value: re
          }
        }
      },
      phoneInfo () {
        if (isUndefined(this.phone)) {
          return
        }

        var re = /^(?:1(3|4|5|7|8)\d{9})|(?:\(\d{3,4}\)|\d{3,4}-|\s)\d{7,14}$/
        if (this.phone) {
          return {
            msg: this.phone,
            value: re
          }
        } else {
          return {
            msg: '电话格式不正确！',
            value: re
          }
        }
      },
      patternInfo () {
        if (isUndefined(this.pattern)) {
          return
        }

        if (Array.isArray(this.pattern)) {
          return {
            msg: this.pattern[1],
            value: this.pattern[0]
          }
        } else {
          return {
            msg: '模式匹配不正确！',
            value: this.pattern
          }
        }
      }
    },
    methods: {
      slots () {
        if (!this.$slots.default) {
          throw new Error('no element inside of form-control')
        }
        var before = true
        var slots = this.$slots.default.reduce((res, s) => {
          if (!s.tag) {
            return res
          }

          var isControl = /vue-component-\d+-form-(?:textlist|position|input|automatch|textarea|checkbox|radio|select|mselect|address|datepicker|monthpicker)/.test(s.tag)
          var props = getVnodeProps(s)
          isControl = isControl || !isUndefined(props.control)

          if (isControl) {
            before = false
            if (res.elm) {
              throw new Error('form-control can only have one input type element')
            }
            if (this.__afCheckHandler || !![
              'required', 'number', 'min', 'max', 'email', 'url', 'phone', 'pattern', 'maxlength'
            ].find(k => !isUndefined(this[k]))) {
              props.__afControlBus = this.bus
              props.number = this.number
            }

            res.elm = s
          } else {
            let data = getVnodeData(s)
            if (!data.staticClass || data.staticClass.indexOf('af-form-control-label') === -1) {
              data.staticClass = (data.staticClass ? `${data.staticClass} ` : '') + 'af-form-control-label'
            }

            if (before) {
              res.before.push(s)
            } else {
              res.after.push(s)
            }
          }

          return res
        }, {
          before: [],
          elm: null,
          after: []
        })

        if (slots.before.length) {
          let data = getVnodeData(slots.before[slots.before.length - 1])
          if (!data.staticClass || data.staticClass.indexOf('_af_before') === -1) {
            data.staticClass = (data.staticClass ? `${data.staticClass} ` : '') + '_af_before'
          }
        }
        if (slots.after.length) {
          let data = getVnodeData(slots.after[0])
          if (!data.staticClass || data.staticClass.indexOf('_af_after') === -1) {
            data.staticClass = (data.staticClass ? `${data.staticClass} ` : '') + '_af_after'
          }
        }
        if (!slots.elm) {
          throw new Error('form-control must have one input type element')
        }

        return slots
      },
      check (val) {
        var hasError = false
        var errorInfo = null
        if (this.requiredInfo) {
          hasError = !(Array.isArray(val) ? (val && val.length) : (val || val === 0))
          errorInfo = this.requiredInfo
        }
        if (this.numberInfo && !hasError) {
          hasError = val && !isNumber(val)
          errorInfo = this.numberInfo
        }
        if (this.maxlengthInfo && !hasError) {
          hasError = (val || val === 0) && (val + '') && (val + '').length > this.maxlengthInfo.value
          errorInfo = this.maxlengthInfo
        }
        if (this.minInfo && !hasError) {
          hasError = (val || val === 0) && val < this.minInfo.value
          errorInfo = this.minInfo
        }
        if (this.maxInfo && !hasError) {
          hasError = (val || val === 0) && val > this.maxInfo.value
          errorInfo = this.maxInfo
        }
        if (this.emailInfo && !hasError) {
          hasError = val && !this.emailInfo.value.test(val)
          errorInfo = this.emailInfo
        }
        if (this.urlInfo && !hasError) {
          hasError = val && !this.urlInfo.value.test(val)
          errorInfo = this.urlInfo
        }
        if (this.phoneInfo && !hasError) {
          hasError = val && !this.phoneInfo.value.test(val)
          errorInfo = this.phoneInfo
        }
        if (this.patternInfo && !hasError) {
          hasError = val && !this.patternInfo.value.test(val)
          errorInfo = this.patternInfo
        }

        if (!hasError) {
          this.error = ''
        }

        // 特殊验证
        return new Promise(resolve => {
          if (this.__afCheckHandler && !hasError) {
            this.$emit('check', [val, resolve])
          } else {
            resolve(hasError && errorInfo.msg || '')
          }
        }).then(msg => {
          this.error = msg
          if (this.__afErrors) {
            this.__afErrors[this.name] = msg
            this.__afErrors.__afHasError = !!Object.keys(this.__afErrors).find(k => k.indexOf('__af') === -1 && this.__afErrors[k])
          }
          return msg
        })
      }
    },
    render (h) {
      if (isUndefined(this.__afCheckHandler)) {
        this.__afCheckHandler = hasVnodeListener(this.$vnode, 'check')
      }

      var errorMsg = this.showError ? this.error : ''
      var slots = this.slots()
      var children = []

      children = children.concat(slots.before)
      children.push(
        h('div', {
          staticClass: 'af-form-control-input',
          class: {
            _af_before: !slots.before.length,
            _af_after: !slots.after.length,
            _af_middle: slots.before.length && slots.after.length
          }
        }, [slots.elm].concat(errorMsg && [
          h('div', {
            staticClass: 'af-form-control-error'
          }, [
            h('span', errorMsg)
          ])
        ] || []))
      )
      children = children.concat(slots.after)

      return h('div', {
        staticClass: 'af-form-control',
        class: {
          '_af_form_control_error': this.error && this.showError
        }
      }, children)
    }
  }
</script>
<style lang="less">
  @import (reference) '../../style/variable.less';

  .af-form-control {
    &._af_form_control_error .af-form-control-input .af-input-control {
      border-color: @error;
    }

    .af-form-control-input {
      position: relative;

      .af-form-control-error {
        position: absolute;
        left: 5px;
        top: 100%;
        margin-top: 3px;
        font-size: 12px;
        color: @error;
        i, span {
          vertical-align: middle;
        }
        i {
          font-size:16px
        }
      }
    }
  }

  .af-form-control.af-inline {
    .af-form-control-label {
      display: inline-block;
      vertical-align: middle;
      text-align: center;
    }
    .af-form-control-input {
      display: inline-block;
      vertical-align: middle;
    }
  }

  .af-form-control.af-group {
    display: table !important;

    .af-form-control-label,
    .af-form-control-input {
      display: table-cell !important;
    }

    .af-form-control-label {
      width: 1%;
      white-space: nowrap;
      padding: 0 14px;
      border-radius: 2px;
      background: @primary;
      color: #fff;
      vertical-align: middle;
      text-align: center;
      &._af_before {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      &._af_after {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }

    .af-form-control-input {
      &._af_before .af-input-control {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: none;
      }
      &._af_after .af-input-control {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        border-left: none;
      }
      &._af_middle .af-input-control {
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  }
</style>
