<script>
import {getAttrs, getProps, cloneVnode} from '../../vnode'
import {Type} from '../../util'

export default {
  props: {
    table: {
      required: true,
      thead: Object,
      tbody: {
        type: Array,
        required: true
      },
      tfoot: Object
    },
    rowspan: Boolean
  },
  methods: {
    wrappers () {
      var slots = this.$slots.default || []
      var expanded = expand(slots.filter(s => s.tag))

      if (!expanded) {
        return
      }

      return adjustSpan(clearSpan(expanded).map(row => row.map(node => {
        return {node}
      })))
    }
  },
  render (h) {
    var wrappers = this.wrappers()
    var columns = wrappers ? wrappers[wrappers.length - 1].map(wrapper => wrapper.node) : []
    var bodyKeys = this.rowspan ? columns.map(s => getProps(s).body) : null

    return h('table', {
      staticClass: 'km-table'
    }, [
      getHead(h, wrappers, this.table.thead),
      h('tbody', this.rowspan ? (this.table.tbody.reduce((res, row) => {
        return res.concat(getMRow(h, columns, bodyKeys, row))
      }, [])) : this.table.tbody.map(row => getRow(h, columns, row))),
      this.table.tfoot ? getFoot(h, columns, this.table.tfoot) : ''
    ])
  }
}

// 生成表体的行
function getRow (h, columns, row) {
  return h('tr', columns.map(s => {
    var node = cloneVnode(s)
    var props = getProps(node)
    props.type = 'body'
    props.row = row

    return node
  }))
}

function getMRow (h, columns, bodyKeys, row) {
  var [fields, spans] = parseMRow(row, bodyKeys.filter(_ => _))

  // 未指定 body 属性的 Tcell 的 rowspan 应该是 spans[0] 的最大值
  // spans 只和给定了 body 属性的单元格对应，需要根据 fields 中数组索引找到 spans 数组的列索引
  var indexMap = bodyKeys.reduce((res, f, i) => {
    if (f) {
      res[i] = res.count++
    }
    return res
  }, { count: 0 })

  return fields.map((_, rownum) => h('tr', columns.reduce((res, s, i) => {
    var node = null
    var field = bodyKeys[i]
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

    var [attrs, props] = [getAttrs(node), getProps(node)]
    props.row = row
    props.type = 'body'

    delete attrs.rowspan
    delete attrs.colspan
    if (span !== 1) {
      attrs.rowspan = span
    }
    if (field) {
      props.body = fields[rownum][indexMap[i]]
    }

    res.push(node)
    return res
  }, [])))
}

// 生成表头
function getHead (h, wrappers, row) {
  return h('thead', wrappers.map(rowCells => h('tr', rowCells.reduce((res, wrapper) => {
    if (!wrapper.render) {
      return res
    }

    var node = cloneVnode(wrapper.node)
    var props = getProps(node)
    props.type = 'head'
    props.row = row

    res.push(node)
    return res
  }, []))))
}

// 生成表尾
function getFoot (h, columns, row) {
  return h('tfoot', [
    h('tr', columns.map(s => {
      var node = cloneVnode(s)
      var props = getProps(node)
      props.type = 'foot'
      props.row = row
      return node
    }))
  ])
}

// 清理rowspan和colspan属性
function clearSpan (rows) {
  rows.forEach(row => {
    row.forEach(node => {
      var attrs = getAttrs(node)
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
      var attrs = getAttrs(node)

      // row[j]位于子矩阵第一行
      if (node !== aboveNode) {
        attrs.colspan = !attrs.colspan ? 1 : (attrs.colspan + 1)
      }
      // row[j]位于子矩阵第一列
      if (node !== prevNode) {
        attrs.rowspan = !attrs.rowspan ? 1 : (attrs.rowspan + 1)
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
* @return
*  format: [[{node}, {node}], [{node}, {node}], ...],
*  desc: 返回数组中的元素表示一行的各个元素
*        如果左右相邻元素相同，则表示要列合并
*        如果上下相邻元素相同，则表示要行合并
*/
function expand (forest) {
  if (Array.isArray(forest)) {
    return forest.reduce((res, f) => {
      var expanded = expand(f)
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

  var children = forest.componentOptions.children
  // 不会渲染当前tcell
  if (!children || forest.tag !== children[0].tag) {
    return [[forest]]
  } else {
    // 子元素是嵌套的tcell
    let expanded = expand(children.filter(child => child.tag))
    if (expanded) {
      expanded.unshift(expanded[0].map(_ => forest))
    }
    return expanded
  }
}

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
        if (keys.length > 1 && !Type.isObject(row[hk])) {
          throw new Error(`${hk}.: ${hk}字段不是对象`)
        }
      }

      if (Array.isArray(row[hk])) {
        sift[hk] = sift[hk] || []

        row[hk].forEach((elem, i) => {
          if (Array.isArray(elem)) {
            throw new Error(`${hk}字段是数组，但是${hk}[${i}]也是数组`)
          }

          if (Type.isObject(elem)) {
            sift[hk][i] = sift[hk][i] || {}
            siftField(elem, tk, sift[hk][i])
          } else {
            sift[hk][i] = 1
          }
        })
      } else if (Type.isObject(row[hk])) {
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
            return key ? (key + tk) : tk
          })
        }))

        return res
      }, [])

      if (!rows.length) {
        rows = [[`${key}[0]`]]
      }
    } else if (Type.isObject(row)) {
      let keyCols = []
      let rowNum = 0

      Object.keys(row).forEach(k => {
        let val = row[k]
        let flatten = flattenField(val, k).map(t => {
          return t.map(tk => {
            return key ? `${key}.${tk}` : tk
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
.km-table {
  table-layout: fixed;
  width: 100%;
}
</style>
