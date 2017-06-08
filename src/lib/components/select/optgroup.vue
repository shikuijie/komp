<script>
import Bus from '../../bus'
import {getProps} from '../../vnode'
import Checkbox from '../checkbox.vue'

export default {
  components: {
    Checkbox
  },
  name: 'km-optgroup',
  props: {
    label: {
      type: String,
      required: true
    },
    multiple: Boolean,
    selectBus: Bus,
    selectOptions: Object,
    selectValue: null,
    selectExpand: Boolean,
    level: Number
  },
  data () {
    return {
      options: this.multiple ? {} : undefined,
      expanded: false
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    slots.forEach(slot => {
      if (slot.tag && slot.tag.indexOf('km-option') !== -1) {
        let props = getProps(slot)
        props.selectOptions = this.selectOptions
        props.selectValue = this.selectValue
        props.multiple = this.multiple
        props.level = this.level + 1

        if (this.multiple) {
          props.groupOptions = this.options
        } else {
          props.selectBus = this.selectBus
        }
      }
    })

    return h('ul', {
      staticClass: 'km-optgroup',
      class: {
        km_optgroup_visible: !this.selectExpand || this.expanded
      },
      attrs: {
        multiple: this.multiple
      }
    }, [
      // 组名
      h('li', {
        staticClass: 'km_optgroup_name',
        attrs: {
          level: this.level
        }
      }, [
        this.multiple && h(Checkbox, {
          props: {
            label: this.label,
            value: Object.keys(this.options).every(val => this.selectValue.indexOf(val) !== -1)
          },
          on: {
            change: val => {
              if (val) {
                Object.keys(this.options).forEach(val => {
                  if (this.selectValue.indexOf(val) === -1) {
                    this.selectValue.push(val)
                  }
                })
              } else {
                Object.keys(this.options).forEach(val => {
                  var idx = this.selectValue.indexOf(val)
                  if (idx !== -1) {
                    this.selectValue.splice(idx, 1)
                  }
                })
              }
            }
          }
        }) || this.label,
        // 收起和展开选项图标
        this.selectExpand && h('div', {
          staticClass: 'km_optgroup_icon km-cursor'
        }, [
          h('i', {
            staticClass: `icon-caret-${this.expanded ? 'up' : 'down'}`,
            on: {
              click: $event => {
                $event.stopPropagation()
                this.expanded = !this.expanded
              }
            }
          })
        ]) || ''
      ]),
      // 本组所有选项
      ...slots
    ])
  }
}
</script>

<style lang="less">
.km-optgroup {
  &:not([multiple]) .km_optgroup_name:hover {
    background: transparent;
    color: inherit;
  }

  &.km_optgroup_visible .km-option {
    display: block;
  }
  .km_optgroup_name {
    position: relative;
    .km_optgroup_icon {
      position: absolute;
      height: 100%;
      top: 0;
      right: 5px;
      font-size: 12px;
    }
  }

  .km-option {
    display: none;
  }
}
</style>
