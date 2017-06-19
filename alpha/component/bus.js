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

  fn.mId = ++this.mFnId
  return fn.mId
}

Bus.prototype.$off = function (action, fnId) {
  if (isUndefined(fnId)) {
    this[action] = []
    return
  }

  var idx = -1
  for (let i = 0; i < this[action].length; i++) {
    if (this[action][i].mId === fnId) {
      idx = i
      break
    }
  }

  if (idx !== -1) {
    this[action].splice(idx, 1)
  }
}

function Bus () {
  this.mFnId = 0
}
export default Bus
