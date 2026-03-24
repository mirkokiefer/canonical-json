function isObject(a) {
  return Object.prototype.toString.call(a) === '[object Object]'
}

function copyObjectWithSortedKeys(obj, cmp, seen) {
  if (isObject(obj)) {
    if (seen.has(obj)) throw new TypeError('Converting circular structure to JSON')
    seen.add(obj)
    const sorted = {}
    for (const key of Object.keys(obj).sort(cmp)) {
      sorted[key] = copyObjectWithSortedKeys(obj[key], cmp, seen)
    }
    seen.delete(obj)
    return sorted
  } else if (Array.isArray(obj)) {
    if (seen.has(obj)) throw new TypeError('Converting circular structure to JSON')
    seen.add(obj)
    const result = obj.map(item => copyObjectWithSortedKeys(item, cmp, seen))
    seen.delete(obj)
    return result
  }
  return obj
}

export function stringifyCopy(value, keyCompare) {
  const cmp = typeof keyCompare === 'function' ? keyCompare : undefined
  return JSON.stringify(copyObjectWithSortedKeys(value, cmp, new Set()))
}
