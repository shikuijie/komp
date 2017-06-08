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
