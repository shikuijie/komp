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
      // $label: field name of label
      // $value: field name of value
      // $children: field name of children
      type: Object,
      required: true
    },

    // autocomplete
    editable: Boolean,
    // able to select more than one leaf options
    multiple: Boolean,
    cascaded: Boolean
  },
  data () {
    return {
      text: null,
      currentPath: []
    }
  },
  computed: {
    flbl () {
      return this.option.$label || 'label'
    },
    fval () {
      return this.option.$value || 'value'
    },
    fsub () {
      return this.option.$children || 'children'
    },
    dataMap () {
      function transform (options, parent, map, level) {
        options.forEach(option => {
          map.set(option[this.fval], {parent, option, level})

          var children = option[this.fsub]
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
          data && res.push(data.option[this.flbl])
          return res
        }, []).join('/')
      }

      return label
    },
    sublist () {
      return this.option[this.fsub] || []
    }
  },
  watch: {
    labelStr (val) {
      if (this.editable) {
        this.text = val
      }
    }
  },
  methods: {
    isActive (option) {
      var children = option[this.fsub]
      if (this.multiple) {
        if (!children) {
          return this.value.indexOf(option[this.fval]) !== -1
        } else {
          return children.every(child => this.isActive(child))
        }
      } else if (this.cascaded) {
        return this.value.indexOf(option[this.fval]) !== -1
      } else {
        return this.value === option[this.fval]
      }
    },
    select (option) {
      if (this.multiple) {
        let children = option[this.fsub]
        if (!children) {
          let idx = this.value.indexOf(option[this.fval])
          if (idx === -1) {
            this.value.push(option[this.fval])
          } else {
            this.value.splice(idx, 1)
          }
        } else {
          children.forEach(this.select)
        }
      } else if (this.cascaded) {
        let val = option[this.fval]
        let data = this.dataMap.get(val)
        let vals = [val]
        while (data.level > 1) {
          data = this.dataMap.get(data.parent[this.fval])
          vals.unshift(data.option[this.fval])
        }
        this.value.splice(0, this.value.length, ...vals)
        this.bus.$emit('dropdown.hide')
      } else {
        this.$emit('input', option[this.fval])
        this.bus.$emit('dropdown.hide')
      }

      console.log(this.value)
      this.$emit('change', this.value)
    },
    clear (val) {
      if (this.multiple && val) {
        this.value.splice(this.value.indexOf(val), 1)
      } else if (this.multiple || this.cascaded) {
        this.value.splice(0, this.value.length)
      } else {
        this.$emit('input', null)
      }
      this.$emit('change', this.value)
    },
    onEdit ($event) {
      this.text = $event.target.value
      if (this.mEditing) {
        return
      }

      var text = this.text
      if (this.mTimeHandle) {
        window.clearTimeout(this.mTimeHandle)
      }
      this.mTimeHandle = window.setTimeout(() => {
        this.mTimeHandle = null
        this.editHandler(text)
      }, 800)
    },
    editDone (text) {
      if (this.mPrevText && this.mPrevText !== text) {
        this.editHandler(this.mPrevText)
      }
    },
    editHandler (text) {
      if (this.mFetching) {
        this.mPrevText = text
        return
      }

      var option = {[this.fsub]: []}
      var currentPath = []
      this.fetch({option, text, currentPath}).then(
        () => {
          this.option[this.fsub] = option[this.fsub]
          this.currentPath = currentPath
          this.editDone(text)
        },
        () => this.editDone(text)
      )
    },
    getEditor (h) {
      return this.editable ? [
        h('input', {
          slot: 'label', ref: 'input',
          attrs: {type: 'text', placeholder: this.placeholder},
          domProps: {value: this.text},
          on: {
            click: () => {
              if (this.text && !this.option[this.fsub].length) {
                this.editHandler(this.text)
              }
            },
            input: this.onEdit,
            compositionstart: () => this.mEditing = true,
            compositionend: () => this.mEditing = false
          }
        })
      ] : []
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
            this.dataMap.get(val).option[this.flbl],
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
        let parent = this.dataMap.get(opt[this.fval]).parent
        let children = parent[this.fsub]
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
                label: opt[this.flbl],
                value: opt[this.fval],
                leaf: !opt[this.fsub],
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
    fetch ({option, cascadedValues, text, currentPath}) {
      if (!option[this.fsub]) {
        return // leaf: no need to fetch children
      } else {
        while (option[this.fsub].length) {
          let val = cascadedValues && cascadedValues.shift()
          option = option[this.fsub].find(opt => Type.isUndefined(val) || opt[this.fval] === val)
          currentPath.push(option)
          if (!option[this.fsub]) {
            return // leaf: no need to fetch children
          }
        }

        // fetch children
        this.mFetching = true
        return new Promise(resolve => {
          if (this.mHasFetchEvent) {
            this.$emit('fetch', {option, text, resolve})
          } else {
            resolve()
          }
        }).then(() => {
          this.mFetching = false
          var val = cascadedValues && cascadedValues.shift()
          var next = option[this.fsub].find(opt => Type.isUndefined(val) || opt[this.fval] === val)
          if (next) {
            currentPath.push(next)
            return this.fetch({option: next, cascadedValues, text, currentPath})
          }
        }, () => {
          this.mFetching = false
        })
      }
    }
  },
  render (h) {
    var data = this.getDropdownData()
    var editor = this.getEditor(h)
    var labels = this.getDropdownLabels(h)
    var list = this.getDropdownList(h)
    return h(Dropdown, data, [
      ...editor,
      ...labels,
      ...list
    ])
  },
  created () {
    // define an async event to fetch next level of options
    this.mHasFetchEvent = hasListener(this.$vnode, 'fetch')

    if (!this.sublist) {
      throw new Error(`Select options must have an Array field: ${this.fsub}`)
    }

    if ((this.cascaded || this.multiple) && !Array.isArray(this.value)) {
      throw new Error('Model of multiple/cascaded Select must be an array!')
    }

    this.bus.$on('option.select', this.select)
    this.bus.$on('option.hover', option => {
      if (this.currentPath.indexOf(option) !== -1 || this.mFetching) {
        return
      }
      var idx = this.dataMap.get(option[this.fval]).level - 1
      this.currentPath.splice(idx, this.currentPath.length - idx, option)
      this.fetch({option, currentPath: this.currentPath})
    })
  },
  mounted () {
    var cascadedValues = this.cascaded ? this.value.slice() : undefined
    this.fetch({option: this.option, cascadedValues, currentPath: this.currentPath})
  },
  destroyed () {
    this.bus.$off('option.select')
    this.bus.$off('option.hover')
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