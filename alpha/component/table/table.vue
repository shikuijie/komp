<script>
  import {isUndefined, isObject, cloneVnode, parseExpr, getVnodeAttrs, getVnodeProps} from '../util'
  import Bus from 'ui/bus'

  export default {
    props: {
      table: {
        thead: Object,
        tbody: {
          type: Array,
          required: true
        },
        tfoot: Object,
        columns: Array
      }
    },
    computed: {
      extraRow () {
      },
      slotWrappers () {
        if (!this.$slots.default) {
          throw new Error('no tcolumns inside table')
        }

        var slots = this.$slots.default.filter(s => s.tag)
        var columns = this.table.columns
        var expanded = expand(slots, columns && columns.reduce((res, title) => {
          res[title] = true
          return res
        }, {}))

        if (!expanded) {
          return
        }

        return adjustSpan(clearSpan(expanded).map(row => row.map(node => {
          return {node}
        })))
      },
      bodySlots () {
        return this.slotWrappers && this.slotWrappers[this.slotWrappers.length - 1].map(wrapper => wrapper.node)
      },
      bodyFields () {
        return this.bodySlots && this.bodySlots.map(s => getVnodeProps(s).field)
      },
      isMultiple () {
        return this.bodyFields && this.bodyFields.find(f => f && f.indexOf('[]') !== -1)
      }
    },
    render (h) {
      var head = h(Head, {
        props: {
          row: this.table.thead,
          table: this.table,
          wrappers: this.slotWrappers
        }
      })

      if (!this.table.tbody) {
        throw new Error('table.tbody must be Array')
      }

      var extraBuses = []
      var hasExtraRows = !!this.$scopedSlots.extra
      if (hasExtraRows) {
        extraBuses = this.table.tbody.map(() => new Bus())
      }

      var extraRows = hasExtraRows ? this.isMultiple && this.table.tbody.map((row, i) => h(ExtraMRow, {
        props: {
          row,
          table: this.table,
          bus: extraBuses[i],
          span: this.bodySlots.length,
          slots: this.$scopedSlots.extra
        }
      })) || this.table.tbody.map((row, i) => h(ExtraRow, {
        props: {
          row,
          table: this.table,
          bus: extraBuses[i],
          span: this.bodySlots.length,
          slots: this.$scopedSlots.extra
        }
      })) : null

      var rows = this.isMultiple && this.table.tbody.map((row, i) => h(MRow, {
        props: {
          row,
          table: this.table,
          bus: extraBuses[i],
          slots: this.bodySlots,
          fields: this.bodyFields
        }
      })) || this.table.tbody.map((row, i) => h(Row, {
        props: {
          row,
          table: this.table,
          bus: extraBuses[i],
          slots: this.bodySlots
        },
        class: {
          'af-odd': !(i % 2),
          'af-even': i % 2
        }
      }))

      if (extraRows) {
        rows = rows.reduce((res, row, i) => {
          res.push(row)
          res.push(extraRows[i])
          return res
        }, [])
      }

      var body = this.isMultiple && rows || [ h('tbody', rows) ]

      return h('table', {
        staticClass: 'af-table'
      }, this.table.tfoot && [head, ...body, h(Foot, {
        props: {
          row: this.table.tfoot,
          table: this.table,
          slots: this.bodySlots
        }
      })] || [head, ...body])
    }
  }

  var Head = {
    props: ['row', 'table', 'wrappers'],
    render (h) {
      return h('thead', this.wrappers.map(row => h('tr', row.reduce((res, wrapper) => {
        if (!wrapper.render) {
          return res
        }

        var node = cloneVnode(wrapper.node)
        var [attrs, props] = [getVnodeAttrs(node), getVnodeProps(node)]
        props.row = this.row
        props.table = this.table
        props.isHead = true

        if (props.title) {
          props.cell = parseExpr(props.title, this.row)
          if (!props.cell) {
            props.cell = props.title
          }
        }
        if (attrs.colspan === 1) {
          delete attrs.colspan
        }
        if (attrs.rowspan === 1) {
          delete attrs.rowspan
        }

        res.push(node)
        return res
      }, []))))
    }
  }

  var Foot = {
    props: ['row', 'table', 'slots'],
    render (h) {
      return h('tfoot', [
        h('tr', this.slots.map(s => {
          var node = cloneVnode(s)
          var props = getVnodeProps(node)
          props.row = this.row
          props.table = this.table
          props.isFoot = true

          if (props.note) {
            props.cell = parseExpr(props.note, this.row)
          }
          return node
        }))
      ])
    }
  }

  var ExtraRow = {
    props: ['row', 'table', 'bus', 'slots', 'span'],
    data () {
      return {
        visible: false
      }
    },
    render (h) {
      if (!this.bus.show) {
        this.visible = false
        this.bus.$on('hide', () => {
          this.visible = false
        })
        this.bus.$on('show', () => {
          this.visible = true
        })
      }

      var slots = this.slots({row: this.row, table: this.table, extra: this.bus})
      return h('tr', {
        style: {
          display: this.visible ? '' : 'none'
        }
      }, [
        h('td', {
          staticClass: 'af-extra',
          attrs: {
            colspan: this.span
          }
        }, slots)
      ])
    }
  }
  var Row = {
    props: ['row', 'table', 'bus', 'slots'],
    render (h) {
      return h('tr', this.slots.map(s => {
        var node = cloneVnode(s)
        var props = getVnodeProps(node)
        var attrs = getVnodeAttrs(node)

        props.row = this.row
        props.table = this.table
        props.bus = this.bus
        props.isBody = true
        if (props.field) {
          props.cell = parseExpr(props.field, this.row)
        }

        delete attrs.colspan
        delete attrs.rowspan

        return node
      }))
    }
  }

  var ExtraMRow = {
    props: ['row', 'table', 'bus', 'slots', 'span'],
    data () {
      return {
        visible: false
      }
    },
    render (h) {
      if (!this.bus.show) {
        this.visible = false
        this.bus.$on('hide', () => {
          this.visible = false
        })
        this.bus.$on('show', () => {
          this.visible = true
        })
      }
      var slots = this.slots({row: this.row, table: this.table, extra: this.bus})
      return h('tbody', {
        style: {
          display: this.visible ? '' : 'none'
        }
      }, [
        h('tr', [
          h('td', {
            staticClass: 'af-extra',
            attrs: {
              colspan: this.span
            }
          }, slots)
        ])
      ])
    }
  }
  var MRow = {
    props: ['row', 'bus', 'table', 'fields', 'slots'],
    render (h) {
      var [fields, spans] = parseMRow(this.row, this.fields.filter(_ => _))

      // 未指定field属性的tcell的rowspan应该是spans[0]的最大值
      // spans只和给定了field属性的单元格对应，需要根据this.fields中数组索引找到spans数组的列索引
      var indexMap = this.fields.reduce((res, f, i) => {
        if (f) {
          res[i] = res.count++
        }
        return res
      }, { count: 0 })

      return h('tbody', fields.map((_, rownum) => h('tr', this.slots.reduce((res, s, i) => {
        var node = null
        var field = this.fields[i]
        var span = 1

        if (field) {
          if (spans[rownum][indexMap[i]] === 0) {
            return res
          } else {
            node = cloneVnode(s)
            span = spans[rownum][indexMap[i]]
          }
        } else if (rownum === 0) {
          node = cloneVnode(s)
          span = fields.length
        }

        if (!node) {
          return res
        }

        var [attrs, props] = [getVnodeAttrs(node), getVnodeProps(node)]
        props.row = this.row
        props.table = this.table
        props.bus = this.bus
        props.isBody = true

        delete attrs.rowspan
        delete attrs.colspan
        if (span !== 1) {
          attrs.rowspan = span
        }
        if (field) {
          props.field = fields[rownum][indexMap[i]]
          props.cell = parseExpr(props.field, this.row)
        }

        res.push(node)
        return res
      }, []))))
    }
  }

  // 每次columns改变重新渲染时清理rowspan和colspan属性
  function clearSpan (rows) {
    rows.forEach(row => {
      row.forEach(node => {
        var attrs = getVnodeAttrs(node)
        delete attrs.colspan
        delete attrs.rowspan
      })
    })
    return rows
  }
  /**
  * 调整单元格的rowspan和colspan
  */
  function adjustSpan (wrappers) {
    for (let i = 0; i < wrappers.length; i++) {
      let wrapper = wrappers[i]
      let aboveWrapper = wrappers[i - 1] || []
      for (let j = 0; j < wrapper.length; j++) {
        let node = wrapper[j].node
        let prevNode = wrapper[j - 1] && wrapper[j - 1].node
        let aboveNode = aboveWrapper[j] && aboveWrapper[j].node
        var attrs = getVnodeAttrs(node)

        // row[j]位于子矩阵第一行
        if (node !== aboveNode) {
          attrs.colspan = isUndefined(attrs.colspan) && 1 || (attrs.colspan + 1)
        }
        // row[j]位于子矩阵第一列
        if (node !== prevNode) {
          attrs.rowspan = isUndefined(attrs.rowspan) && 1 || (attrs.rowspan + 1)
        }

        // row[j]位于子矩阵左上角，渲染时保留
        if (node !== aboveNode && node !== prevNode) {
          wrapper[j].render = true
        }
      }
    }

    return wrappers
  }

  /**
  * @return {
  *  format: [[{node}, {node}], [{node}, {node}], ...],
  *  desc: 返回数组中的元素表示一行的各个元素
  *        如果左右相邻元素相同，则表示要列合并
  *        如果上下相邻元素相同，则表示要行合并
  * }
  */
  function expand (forest, titles) {
    if (Array.isArray(forest)) {
      return forest.reduce((res, f) => {
        var expanded = expand(f, titles)
        if (!expanded) {
          return res
        }
        if (!res) {
          return expanded
        }

        while (res.length > expanded.length) {
          expanded.push(expanded[expanded.length - 1])
        }
        while (expanded.length > res.length) {
          res.push(res[res.length - 1])
        }

        return res.map((el, i) => el.concat(expanded[i]))
      }, null)
    }

    var title = getVnodeProps(forest).title
    var children = forest.componentOptions.children
    // 不会渲染当前tcell
    if (title && titles && !titles[title]) {
      if (children && forest.tag === children[0].tag) {
        return expand(children.filter(child => child.tag), titles)
      }
    } else {
      if (!children || forest.tag !== children[0].tag) {
        return [[forest]]
      } else {
        // 子元素是嵌套的tcell
        let expanded = expand(children.filter(child => child.tag), titles)
        if (expanded) {
          expanded.unshift(expanded[0].map(_ => forest))
        }
        return expanded
      }
    }
  }

  // 展开row中的数组类型字段
  function parseMRow (row, keys) {
    fixRow(row, keys)

    var rows = flattenField(siftRow(row, keys))
    var rowspan = mergeRow(rows)

    return [rows, rowspan]

    // 将row对象中与colKeys有关的成员补全
    function fixRow (row, colKeys) {
      colKeys.forEach(key => {
        fixField(row, key.split('.'))
      })

      // keys指定了row中某个成员的取值路径
      // 如果row中该成员不存在,则补全该路径上的成员
      function fixField (row, keys) {
        let k = keys[0]
        let m = k.match(/^(\w+)\[]$/)
        let tk = keys.slice(1)

        if (m) {
          row[m[1]] = row[m[1]] || []

          if (keys.length > 1) {
            if (row[m[1]].length === 0) {
              row[m[1]].push({})
            }
            row[m[1]].forEach(r => {
              fixField(r, tk)
            })
          }
        } else {
          if (keys.length > 1) {
            row[k] = row[k] || {}
            fixField(row[k], tk)
          }
        }
      }
    }

    // 将row对象中与colKeys有关的成员过滤出来
    function siftRow (row, colKeys) {
      let sift = {}
      colKeys.forEach(ck => {
        siftField(row, ck.split('.'), sift)
      })

      return sift

      // keys指定了row中某个成员的取值路径
      // 将sift中与keys对应的成员的值置为1,表示该成员需要显示
      function siftField (row, keys, sift) {
        let hk = keys[0]
        let m = hk.match(/^(\w+)\[]$/)
        let tk = keys.slice(1)
        if (m) {
          hk = m[1]
          if (!Array.isArray(row[hk])) {
            throw new Error(`${hk}[]: ${hk}字段不是数组`)
          }
        } else {
          if (keys.length > 1 && !isObject(row[hk])) {
            throw new Error(`${hk}.: ${hk}字段不是对象`)
          }
        }

        if (Array.isArray(row[hk])) {
          sift[hk] = sift[hk] || []

          row[hk].forEach((elem, i) => {
            if (Array.isArray(elem)) {
              throw new Error(`${hk}字段是数组，但是${hk}[${i}]也是数组`)
            }

            if (isObject(elem)) {
              sift[hk][i] = sift[hk][i] || {}
              siftField(elem, tk, sift[hk][i])
            } else {
              sift[hk][i] = 1
            }
          })
        } else if (isObject(row[hk])) {
          sift[hk] = sift[hk] || {}
          siftField(row[hk], tk, sift[hk])
        } else {
          sift[hk] = 1
        }

        return sift
      }
    }

    // 将row中的成员平铺
    function flattenField (row, key) {
      let rows = []
      if (Array.isArray(row)) {
        rows = row.reduce((res, elem, i) => {
          res = res.concat(flattenField(elem, `[${i}]`).map(t => {
            return t.map(tk => {
              return key && (key + tk) || tk
            })
          }))

          return res
        }, [])

        if (!rows.length) {
          rows = [[`${key}[0]`]]
        }
      } else if (isObject(row)) {
        let keyCols = []
        let rowNum = 0

        Object.keys(row).forEach(k => {
          let val = row[k]
          let flatten = flattenField(val, k).map(t => {
            return t.map(tk => {
              return key && `${key}.${tk}` || tk
            })
          })

          keyCols.push(flatten)

          if (rowNum < flatten.length) {
            rowNum = flatten.length
          }
        })

        keyCols.forEach(col => {
          while (col.length < rowNum) {
            col.push(col[col.length - 1])
          }
        })

        while (--rowNum >= 0) {
          rows.unshift(keyCols.reduce((res, col) => {
            return res.concat(col[rowNum])
          }, []))
        }
      } else {
        rows.push([key])
      }

      return rows
    }

    // 合并行
    function mergeRow (keyRows) {
      return keyRows.reduce((res, kr, r) => {
        if (r === 0) {
          res.push(kr.map(_ => 1))
        } else {
          res.push(kr.reduce((rres, k, c) => {
            let sr = r - 1
            if (k === keyRows[sr][c]) {
              while (res[sr][c] === 0) { sr-- }
              res[sr][c] += 1
              rres.push(0)
            } else {
              rres.push(1)
            }

            return rres
          }, []))
        }

        return res
      }, [])
    }
  }

</script>
<style lang="less">
  @import (reference) '../../style/variable.less';

  .af-table {
    width: 100%;
  }
</style>