<script>
import {getProps, hasListener} from '../../vnode'
import {Type} from '../../util'
import Bus from '../../bus'

export default {
  name: 'km-form-control',
  props: {
    // control 自己的 Bus 变量
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    },
    // form 的 Bus 变量
    // form 用来控制所有的 control
    formBus: Bus,
    name: {
      type: String,
      required: true
    },

    // 表单验证相关
    required: Boolean | String,
    number: Boolean | String,
    min: Number | String | Array,
    max: Number | String | Array,
    maxlength: Number | Array,
    email: Boolean | String,
    phone: Boolean | String,
    url: Boolean | String,
    pattern: RegExp | Array
  },
  data () {
    return {
      error: null,
      showError: false
    }
  },
  created () {
    this.bus.$on('control.check', val => {
      val = val || this.bus.$emit('control.getvalue')
      return this.check(val)
    })

    this.bus.$on('control.clear', () => {
      this.error = null
    })

    if (this.formBus) {
      this.mFormCheckId = this.formBus.$on('form.inner.check', () => this.bus.$emit('control.check'))
      this.mFormClearId = this.formBus.$on('form.inner.clear', () => this.bus.$emit('control.clear'))
    }
  },
  mounted () {
    this.mHasCheckEvent = hasListener(this.$vnode, 'check')
  },
  destroyed () {
    this.bus.$off('control.check')
    this.bus.$off('control.clear')

    if (this.formBus) {
      this.formBus.$off('form.inner.check', this.mFormCheckId)
      this.formBus.$off('form.inner.clear', this.mFormClearId)
    }
  },
  methods: {
    check (val) {
      var fields = ['required', 'number', 'min', 'max', 'maxlength', 'email', 'phone', 'url', 'pattern']
      var err = null
      // 找到第一个校验不通过的验证项，校验出错时返回错误信息
      for (let f of fields.filter(f => this[f])) {
        err = this[`${f}Check`](val)
        if (err) {
          break
        }
      }
      this.error = err

      return new Promise(resolve => {
        if (!err && this.mHasCheckEvent) {
          // 预定义验证都通过了，再检查用户自定义的验证
          this.$emit('check', {value: val, resolve})
        } else {
          resolve(err)
        }
      }).then(err => {
        this.error = err || null
        return err
      })
    },
    requiredCheck (val) {
      var msg = this.required === true ? '必填项' : this.required
      if (Array.isArray(val)) {
        return val.length ? null : msg
      } else {
        return (val || val === 0) ? null : msg
      }
    },
    numberCheck (val) {
      var msg = this.number === true ? '请输入数字' : this.number
      return (!val || Type.isNumber(val)) ? null : msg
    },
    minCheck (val) {
      var [min, msg] = Array.isArray(this.min) ? this.min : [this.min, '输入过小']
      return ((!val && val !== 0) || min <= val) ? null : msg
    },
    maxCheck (val) {
      var [max, msg] = Array.isArray(this.max) ? this.max : [this.max, '输入过大']
      return ((!val && val !== 0) || max >= val) ? null : msg
    },
    maxlengthCheck (val) {
      val += ''
      var [len, msg] = Array.isArray(this.maxlength) ? this.maxlength : [this.maxlength, '输入过长']
      return val.length <= len ? null : msg
    },
    emailCheck (val) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      var msg = this.email === true ? '邮箱格式不对' : this.email
      return (!val || re.test(val)) ? null : msg
    },
    phoneCheck (val) {
      var re = /^(?:1(3|4|5|7|8)\d{9})|(?:\(\d{3,4}\)|\d{3,4}-|\s)\d{7,14}$/
      var msg = this.phone === true ? '电话格式不对' : this.phone
      return (!val || re.test(val)) ? null : msg
    },
    urlCheck (val) {
      var re = /^(?:https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})$/
      var msg = this.url === true ? '网址格式不对' : this.url
      return (!val || re.test(val)) ? null : msg
    },
    patternCheck (val) {
      var [re, msg] = Array.isArray(this.pattern) ? this.pattern : [this.pattern, '模式不匹配']
      return (!val || re.test(val)) ? null : msg
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      var props = getProps(slot)
      props.controlBus = this.bus
      props.number = !!this.number
    })

    return h('div', {
      staticClass: 'km-form-control'
    }, [
      ...slots,
      h('div', {
        staticClass: 'km_control_error',
        directives: [{
          name: 'show',
          expression: 'error',
          value: this.error
        }]
      }, this.error)
    ])
  }
}
</script>

<style lang="less">
.km-form-control {
  position: relative;
  &.km-inline {
    display: inline-block;
  }

  .km-dropdown {
    width: 100%;
    .km-input {
      width: 100%;
    }
  }
  .km-input {
    width: 100%;
  }

  .km_control_error {
    position: absolute;
    left: 0;
    top: 100%;
    width: 100%;
    height: 20px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    color: red;
  }
}
</style>
