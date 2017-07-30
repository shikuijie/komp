import {Type} from './util'

export function getAttrs (vnode) {
  vnode.data = vnode.data || {}
  vnode.data.attrs = vnode.data.attrs || {}
  return vnode.data.attrs
}
export function getProps (vnode) {
  vnode.componentOptions = vnode.componentOptions || {}
  vnode.componentOptions.propsData = vnode.componentOptions.propsData || {}
  return vnode.componentOptions.propsData
}

export function getChildren (vnode) {
  vnode.componentOptions = vnode.componentOptions || {}
  vnode.componentOptions.children = vnode.componentOptions.children || []
  return vnode.componentOptions.children
}

export function clearChildren (vnode) {
  if (vnode.componentOptions && vnode.componentOptions.children) {
    delete vnode.componentOptions.children
  }
}

export function hasListener (vnode, event) {
  var options = vnode.componentOptions
  var listeners = options && options.listeners
  return !!listeners && listeners[event]
}

export function cloneVnode (obj) {
  if (Array.isArray(obj)) {
    return obj.map(el => cloneVnode(el))
  } else if (Type.isObject(obj) && !obj._isVue) {
    return Object.keys(obj).reduce((res, k) => {
      res[k] = cloneVnode(obj[k])
      return res
    }, {})
  } else {
    return obj
  }
}
