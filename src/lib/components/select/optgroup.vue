<script>
import Vue from 'vue'
import Bus from '../../bus'
import {getProps} from '../../vnode'
import Checkbox from '../checkbox.vue'

export default {
  components: {
    Checkbox
  },
  props: {
    label: String,
    multiple: Boolean,
    selectBus: Bus,
    selectOptions: Array,
    selectValue: null,
    selectExpand: Boolean,
    level: Number
  },
  data () {
    return {
      options: this.multiple ? [] : undefined,
      expanded: false,
      checkboxBus: this.multiple ? new Bus() : null
    }
  },
  methods: {
    toggleOptions () {
      this.expanded = !this.expanded
      Vue.nextTick(() => this.selectBus.$emit('scroll.reset', 'y'))
    }
  },
  render (h) {
    var slots = this.$slots.default || []
    // 显示组标签的slot
    var labelSlot = null
    if (slots[0] && slots[0].tag.indexOf('km-select-option') === -1) {
      labelSlot = slots[0]
      slots = slots.slice(1)
    }
    slots.forEach(slot => {
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
        },
        on: {
          click: event => {
            event.stopPropagation()
            // 单选下拉框，通过单击组标签也可以收起或展开其子选项
            if (this.multiple) {
              this.checkboxBus.$emit('toggle')
            } else if (this.selectExpand) {
              this.toggleOptions()
            }
          }
        }
      }, [
        this.multiple ? h(Checkbox, {
          props: {
            bus: this.checkboxBus,
            value: this.options.every(opt => this.selectValue.indexOf(opt.value) !== -1)
          },
          on: {
            change: val => {
              if (val) {
                this.options.forEach(opt => {
                  if (this.selectValue.indexOf(opt.value) === -1) {
                    this.selectValue.push(opt.value)
                  }
                })
              } else {
                this.options.forEach(opt => {
                  var idx = this.selectValue.indexOf(opt.value)
                  if (idx !== -1) {
                    this.selectValue.splice(idx, 1)
                  }
                })
              }
            }
          }
        }) : '',
        labelSlot || this.label,
        // 收起和展开选项图标
        this.selectExpand ? h('div', {
          staticClass: 'km_optgroup_icon km-cursor'
        }, [
          h('i', {
            staticClass: `icon-caret-${this.expanded ? 'up' : 'down'}`,
            on: {
              click: $event => {
                $event.stopPropagation()
                this.toggleOptions()
              }
            }
          })
        ]) : ''
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
