function isObject(a) {
  return Object.prototype.toString.call(a) === '[object Object]'
}

function copyObjectWithSortedKeys(obj, cmp) {
  if (isObject(obj)) {
    const sorted = {}
    for (const key of Object.keys(obj).sort(cmp)) {
      sorted[key] = copyObjectWithSortedKeys(obj[key], cmp)
    }
    return sorted
  } else if (Array.isArray(obj)) {
    return obj.map(item => copyObjectWithSortedKeys(item, cmp))
  }
  return obj
}

export function stringifyCopy(value, keyCompare) {
  const cmp = typeof keyCompare === 'function' ? keyCompare : undefined
  return JSON.stringify(copyObjectWithSortedKeys(value, cmp))
}