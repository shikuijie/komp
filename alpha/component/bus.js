import {isUndefined} from './util'

Bus.prototype.$emit = function (action) {
  var args = [].slice.call(arguments, 1)
  if (!this[action]) {
    return
  }

  if (this[action].length > 1) {
    return this[action].map(cb => cb.apply(this, args))
  } else if (this[action].length === 1) {
    return this[action][0].apply(this, args)
  }
}

Bus.prototype.$on = function (action, fn) {
  this[action] = this[action] || []
  this[action].push(fn)

  fn.__afId = ++this.__afId
  return fn.__afId
}

Bus.prototype.$off = function (action, fnId) {
  if (isUndefined(fnId)) {
    this[action] = []
    return
  }

  var idx = -1
  for (let i = 0; i < this[action].length; i++) {
    if (this[action][i].__afId === fnId) {
      idx = i
      break
    }
  }

  if (idx !== -1) {
    this[action].splice(idx, 1)
  }
}

var CURRENT_ID = 0
function Bus () {
  this.__afId = ++CURRENT_ID
}
export default Bus
