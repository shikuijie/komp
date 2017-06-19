import Vue from 'vue'

const Instance = new Vue()

export function isServer () {
  return Instance.$isServer
}

// 类型判别
export const Type = ['Number', 'String', 'Object', 'Date'].reduce((res, t) => {
  res[`is${t}`] = function (data) {
    return Object.prototype.toString.apply(data) === `[object ${t}]`
  }
  return res
}, {
  isUndefined: function (val) {
    return typeof val === 'undefined'
  }
})
