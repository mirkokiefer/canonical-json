// Naive implementation, not in use by this module:

var isObject = function(a) {
  return Object.prototype.toString.call(a) === '[object Object]'
}

var copyObjectWithSortedKeys = function(object) {
  if (isObject(object)) {
    var newObj = {}
    var keysSorted = Object.keys(object).sort()
    var key
    for (var i = 0, len = keysSorted.length; i < len; i++) {
      key = keysSorted[i]
      newObj[key] = copyObjectWithSortedKeys(object[key])
    }
    return newObj
  } else if (Array.isArray(object)) {
    return object.map(copyObjectWithSortedKeys)
  } else {
    return object
  }
}

module.exports = function(object) {
  return JSON.stringify(copyObjectWithSortedKeys(object))
}
