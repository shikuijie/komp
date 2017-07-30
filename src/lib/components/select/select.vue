<script>
import Bus from 'lib/bus'
import Scroll from 'komp/scroll.vue'
import Dropdown from 'komp/dropdown.vue'
import SelectOption from './option.vue'
import {Type} from 'lib/util'
import {getProps, cloneVnode, hasListener} from 'lib/vnode'

export default {
  components: {
    Dropdown,
    Scroll,
    SelectOption
  },
  props: {
    bus: {
      type: Bus,
      default () {
        return new Bus()
      }
    },
    controlBus: Bus,
    value: null,
    disabled: Boolean,
    placeholder: String,

    // array of options
    option: {
      type: Object,
      required: true
    },
    fnlbl: {
      type: String,
      default: 'label'
    },
    fnval: {
      type: String,
      default: 'value'
    },
    fnsub: {
      type: String,
      default: 'children'
    },

    // autocomplete
    editable: Boolean,
    // able to select more than one leaf options
    multiple: Boolean,
    cascaded: Boolean
  },
  data () {
    return {
      currentPath: []
    }
  },
  computed: {
    dataMap () {
      function transform (options, parent, map, level) {
        options.forEach(option => {
          map.set(option[this.fnval], {parent, option, level})

          var children = option[this.fnsub]
          children && transform.bind(this)(children, option, map, level + 1)
        })

        return map
      }

      return transform.bind(this)(this.sublist, this.option, new Map(), 1)
    },
    labelStr () {
      var {option} = this.dataMap.get(this.value) || {}
      var label = option ? option.label : null
      if (this.multiple && this.value.length) {
        label = ' '
      }
      if (this.cascaded) {
        label = this.value.reduce((res, val) => {
          var data = this.dataMap.get(val)
          data && res.push(data.option[this.fnlbl])
          return res
        }, []).join('/')
      }

      return label
    },
    sublist () {
      return this.option[this.fnsub] || []
    }
  },
  methods: {
    isActive (option) {
      var children = option[this.fnsub]
      if (this.multiple) {
        if (!children) {
          return this.value.indexOf(option[this.fnval]) !== -1
        } else {
          return children.every(child => this.isActive(child))
        }
      } else if (this.cascaded) {
        return this.value.indexOf(option[this.fnval]) !== -1
      } else {
        return this.value === option[this.fnval]
      }
    },
    select (option) {
      if (this.multiple) {
        let children = option[this.fnsub]
        if (!children) {
          let idx = this.value.indexOf(option[this.fnval])
          if (idx === -1) {
            this.value.push(option[this.fnval])
          } else {
            this.value.splice(idx, 1)
          }
        } else {
          children.forEach(this.select)
        }
      } else if (this.cascaded) {
        let val = option[this.fnval]
        let data = this.dataMap.get(val)
        let vals = [val]
        while (data.level > 1) {
          data = this.dataMap.get(data.parent[this.fnval])
          vals.unshift(data.option[this.fnval])
        }
        this.value.splice(0, this.value.length, ...vals)
        this.bus.$emit('dropdown.hide')
      } else {
        this.$emit('input', option[this.fnval])
        this.bus.$emit('dropdown.hide')
      }
    },
    clear (val) {
      if (this.multiple && val) {
        this.value.splice(this.value.indexOf(val), 1)
      } else if (this.multiple || this.cascaded) {
        this.value.splice(0, this.value.length)
      } else {
        this.$emit('input', null)
      }
    },
    getDropdownData () {
      return {
        staticClass: 'km-select',
        class: {
          km_multiple: this.multiple,
          km_control: !!this.controlBus
        },
        props: {
          bus: this.bus,
          readonly: !this.editable,
          loading: !this.sublist.length,
          placeholder: this.placeholder,
          disabled: this.disabled, clearable: this.clearable,
          label: this.labelStr
        },
        on: {clear: this.clear}
      }
    },
    getDropdownLabels (h) {
      return this.multiple ? [
        h('ul', {
          staticClass: 'km_label_list', slot: 'label'
        }, this.value.reduce((res, val) => {
          var data = this.dataMap.get(val)
          data && res.push(h('li', [
            this.dataMap.get(val).option[this.fnlbl],
            h('i', {
              staticClass: 'km-pointer icon-close-small',
              on: {
                click: $event => {
                  $event.stopPropagation()
                  this.clear(val)
                }
              }
            })
          ]))

          return res
        }, []))
      ] : []
    },
    getDropdownList (h, slot) {
      if (!this.sublist.length) {
        return []
      }

      var path = []
      for (let opt of this.currentPath) {
        let parent = this.dataMap.get(opt[this.fnval]).parent
        let children = parent[this.fnsub]
        if (children && children.length) {
          path.push(children)
        } else {
          break
        }
      }

      return path.map((options, i) => h('div', {
        staticClass: 'km_option_list'
      }, [
        h(Scroll, {
          key: options.map(opt => opt[this.label]).join('/'),
          props: {
            hidden: true,
            bus: new Bus(),
            direction: 'y'
          }
        }, [
          h('ul', {
            staticClass: `km-option-list km-option-level${i}`,
          }, options.map(opt => {
            return h(SelectOption, {
              props: {
                bus: this.bus,
                option: opt,
                label: opt[this.fnlbl],
                value: opt[this.fnval],
                leaf: !opt[this.fnsub],
                multiple: this.multiple,
                cascaded: this.cascaded,
                active: this.isActive(opt),
                onpath: this.currentPath.indexOf(opt) !== -1
              },
              scopedSlots: this.$scopedSlots
            })
          }))
        ])
      ]))
    },
    fetch (option, path) {
      if (!option[this.fnsub]) {
        return // leaf: no need to fetch children
      } else {
        while (option[this.fnsub].length) {
          let val = path && path.shift()
          option = option[this.fnsub].find(opt => opt[this.fnval] === val || Type.isUndefined(val))
          this.currentPath.push(option)
          if (!option[this.fnsub]) {
            return // leaf: no need to fetch children
          }
        }

        // fetch children
        new Promise(resolve => {
          if (this.mHasFetchEvent) {
            this.$emit('fetch', {option, resolve})
          } else {
            resolve()
          }
        }).then(() => {
          var val = path && path.shift()
          var next = option[this.fnsub].find(opt => opt[this.fnval] === val || Type.isUndefined(val))
          if (next) {
            this.currentPath.push(next)
            this.fetch(next, path)
          }
        })
      }
    }
  },
  render (h) {
    var slot = this.$slots.default[0]
    var data = this.getDropdownData()
    var labels = this.getDropdownLabels(h)
    var list = this.getDropdownList(h, slot)
    return h(Dropdown, data, labels.concat(list))
  },
  created () {
    // define an async event to fetch next level of options
    this.mHasFetchEvent = hasListener(this.$vnode, 'fetch')

    if (!this.sublist) {
      throw new Error(`Select options must have an Array field: ${this.fnsub}`)
    }

    if ((this.cascaded || this.multiple) && !Array.isArray(this.value)) {
      throw new Error('Model of multiple/cascaded Select must be an array!')
    }

    this.bus.$on('option.select', this.select)

    this.bus.$on('option.hover', option => {
      if (this.currentPath.indexOf(option) !== -1) {
        return
      }
      var idx = this.dataMap.get(option[this.fnval]).level - 1
      this.currentPath.splice(idx, this.currentPath.length - idx, option)
      this.fetch(option)
    })
  },
  mounted () {
    var path = this.cascaded ? this.value.slice() : undefined
    this.fetch(this.option, path)
  },
  destroyed () {
    this.bus.$off('single.select')
    this.bus.$off('multiple.select')
    this.bus.$off('cascade.select')
    this.bus.$off('cascade.hover')
  }
}
</script>

<style lang="less">
@import (reference) "~style/color.less";
@import (reference) "~style/size.less";

@select-padding-left: 14px;
@select-height: 32px;

.km-suggest,
.km-select {
  &.km_multiple {
    .km_label_list {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      top: 0;
      padding: 0 @input-padding-right 0 @input-padding-left;
      white-space: nowrap;
      overflow: hidden;

      li {
        display: inline;
        border: 1px solid @border-light;
        padding: 2px;
        margin-right: 5px;
        border-radius: @border-radius;
        cursor: default;

        i {
          font-size: 12px;
        }
      }
    }
  }

  .km-optgrp {
    &:not(.km_optgrp_multiple) .km_label:hover {
      background: transparent;
      color: inherit;
    }
  }

  .km-optgrp .km-option .km_label {
    padding-left: @select-padding-left * 2;
  }

  .km-option {
    .km-option-label {
      position: relative;
      height: @select-height;
      padding-left: @select-padding-left;
      line-height: @select-height;

      &:hover {
        background: @bg-light;
        color: @primary;
        cursor: default;
      }

      i.km_option_circle {
        position: absolute;
        top: 50%;
        left: 5px;
        transform: translateY(-2px);
        border: 2px solid @primary;
        border-radius: 2px;
      }
      i.km_option_triangle {
        position: absolute;
        top: 50%;
        right: 5px;
        border: 4px solid transparent;
        border-left-color: inherit;
        transform: translateY(-4px);
      }
    }
  }

  .km-dropdown-frame {
    display: table;
    width: auto;
    min-width: 100%;

    .km_option_list {
      display: table-cell;
      &:not(:first-child) {
        border-left: 1px solid @border-slight;
      }
    }
  }
}
</style>