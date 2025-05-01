let gap = ''
let indent = ''
let rep
let cmp
const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
const meta = { '\b':'\\b', '\t':'\\t', '\n':'\\n', '\f':'\\f', '\r':'\\r', '"':'\\"', '\\':'\\\\' }

function quote(str) {
  escapable.lastIndex = 0
  return escapable.test(str)
    ? '"' + str.replace(escapable, a => meta[a] || ('\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4))) + '"'
    : '"' + str + '"'
}

function str(key, holder) {
  let value = holder[key]
  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }
  if (typeof rep === 'function') {
    value = rep.call(holder, key, value)
  }
  switch (typeof value) {
    case 'string': return quote(value)
    case 'number': return isFinite(value) ? String(value) : 'null'
    case 'boolean':
    case 'undefined':
    case 'object':
      if (value === null) return 'null'
      const mind = gap
      gap += indent
      const partial = []
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) partial[i] = str(i, value) || 'null'
      } else {
        const keys = Object.keys(value).sort(cmp)
        for (const k of keys) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            const v = str(k, value)
            if (v) partial.push(quote(k) + (gap ? ': ' : ':') + v)
          }
        }
      }
      let v
      if (Array.isArray(value)) {
        v = partial.length === 0
          ? '[]'
          : gap
            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']'
      } else {
        v = partial.length === 0
          ? '{}'
          : gap
            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}'
      }
      gap = mind
      return v
    default:
      return String(value)
  }
}

export default function stringify(value, replacer, space, keyCompare) {
  gap = ''
  indent = ''
  rep = replacer
  cmp = typeof keyCompare === 'function' ? keyCompare : undefined
  if (typeof space === 'number') {
    indent = ' '.repeat(space)
  } else if (typeof space === 'string') {
    indent = space
  }
  return str('', { '': value })
}