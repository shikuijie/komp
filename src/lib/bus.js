export default class Bus {
  constructor () {
    this.$id = 0
  }

  $emit (action) {
    if (!this[action]) {
      return
    }

    var args = [].slice.call(arguments, 1)
    var results = this[action].map(fn => fn.apply(this, args))
    return results.length > 1 && results || results[0]
  }

  $on (action, fn) {
    if (!this[action]) {
      this[action] = [fn]
    } else {
      this[action].push(fn)
    }

    fn.$id = ++this.$id
    return fn.$id
  }

  $off (action, id) {
    if (!this[action]) {
      return
    }

    if (id) {
      this[action] = this[action].filter(fn => fn.$id === id)
    } else {
      this[action] = null
    }
  }
}
