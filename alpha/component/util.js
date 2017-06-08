export function isNull (val) {
  return val === null
}
export function isUndefined (val) {
  return typeof val === 'undefined'
}
export function isObject (obj) {
  return Object.prototype.toString.apply(obj) === '[object Object]'
}
export function isFunction (fn) {
  return Object.prototype.toString.apply(fn) === '[object Function]'
}
export function isDate (date) {
  return Object.prototype.toString.apply(date) === '[object Date]'
}
export function isString (str) {
  return Object.prototype.toString.apply(str) === '[object String]'
}
export function isNumber (num) {
  return Object.prototype.toString.apply(num) === '[object Number]'
}
export function isRegExp (re) {
  return Object.prototype.toString.apply(re) === '[object RegExp]'
}

export function assignToExpr (expr, value, ctx) {
  try {
    /*eslint-disable */
    new Function('ctx', '__$afValue', `with(ctx) { ${expr} = __$afValue }`)(ctx, value)
    /*eslint-enable */
  } catch (e) {
  }
}

export function parseExpr (expr, ctx) {
  try {
    /*eslint-disable */
    return new Function('ctx', `with(ctx) { return ${expr} }`)(ctx)
    /*eslint-disable */
  } catch (e) {
  }
}

/**
 * 获取元素相对于整个网页的坐标
 */
export function getElementPosition (elm) {
  var current = elm
  var offsetLeft = 0
  var offsetTop = 0

  while (current) {
    offsetLeft += current.offsetLeft
    offsetTop += current.offsetTop
    current = current.offsetParent
  }

  return {
    left: offsetLeft,
    top: offsetTop,
    right: offsetLeft + elm.offsetWidth,
    bottom: offsetTop + elm.offsetHeight,
    height: elm.offsetHeight,
    width: elm.offsetWidth
  }
}

export function hasVnodeListener (vnode, event) {
  var options = vnode.componentOptions
  var listeners = options && options.listeners
  var handler = listeners && listeners[event]

  return !!handler
}

export function getVnodeData (node) {
  var data = node.data = node.data || {}
  return data
}
export function getVnodeAttrs (node) {
  var data = node.data = node.data || {}
  var attrs = data.attrs = data.attrs || {}
  return attrs
}

export function getVnodeProps (node) {
  var options = node.componentOptions = node.componentOptions || {}
  var props = options.propsData = options.propsData || {}
  return props
}

export function getVnodeListeners (node) {
  var options = node.componentOptions = node.componentOptions || {}
  var listeners = options.listeners = options.listeners || {}
  return listeners
}

export function getVnodeChildren (node) {
  return node.componentOptions && node.componentOptions.children
}

export function cloneVnode (obj) {
  if (Array.isArray(obj)) {
    return obj.map(el => cloneVnode(el))
  } else if (isObject(obj) && !obj._isVue) {
    return Object.keys(obj).reduce((res, k) => {
      res[k] = cloneVnode(obj[k])
      return res
    }, {})
  } else {
    return obj
  }
}
