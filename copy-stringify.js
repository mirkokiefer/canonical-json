function isObject(a) {
  return Object.prototype.toString.call(a) === '[object Object]'
}

function copyObjectWithSortedKeys(obj) {
  if (isObject(obj)) {
    const sorted = {}
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = copyObjectWithSortedKeys(obj[key])
    }
    return sorted
  } else if (Array.isArray(obj)) {
    return obj.map(copyObjectWithSortedKeys)
  }
  return obj
}

export function stringifyCopy(value) {
  return JSON.stringify(copyObjectWithSortedKeys(value))
}