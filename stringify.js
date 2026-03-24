const escapable = /[\\\"\u0000-\u001f]/g
const meta = { '\b':'\\b', '\t':'\\t', '\n':'\\n', '\f':'\\f', '\r':'\\r', '"':'\\"', '\\':'\\\\' }

function quote(str) {
  return '"' + str.replace(escapable, a => meta[a] || ('\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4))) + '"'
}

function str(key, holder, ctx) {
  let value = holder[key]
  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    value = value.toJSON(key)
  }
  if (typeof ctx.rep === 'function') {
    value = ctx.rep.call(holder, key, value)
  }
  switch (typeof value) {
    case 'string': return quote(value)
    case 'number': return isFinite(value) ? Object.is(value, -0) ? '0' : String(value) : 'null'
    case 'boolean': return String(value)
    case 'object':
      if (value === null) return 'null'
      if (ctx.seen.has(value)) throw new TypeError('Converting circular structure to JSON')
      ctx.seen.add(value)
      const mind = ctx.gap
      ctx.gap += ctx.indent
      const partial = []
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) partial[i] = str(i, value, ctx) || 'null'
      } else {
        const keys = ctx.keys || Object.keys(value)
        for (const k of (ctx.keys ? keys : keys.sort(ctx.cmp))) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            const v = str(k, value, ctx)
            if (v) partial.push(quote(k) + (ctx.gap ? ': ' : ':') + v)
          }
        }
      }
      let v
      if (Array.isArray(value)) {
        v = partial.length === 0
          ? '[]'
          : ctx.gap
            ? '[\n' + ctx.gap + partial.join(',\n' + ctx.gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']'
      } else {
        v = partial.length === 0
          ? '{}'
          : ctx.gap
            ? '{\n' + ctx.gap + partial.join(',\n' + ctx.gap) + '\n' + mind + '}'
            : '{' + partial.join(',') + '}'
      }
      ctx.gap = mind
      ctx.seen.delete(value)
      return v
    case 'undefined':
    case 'function':
    case 'symbol':
      return undefined
    case 'bigint':
      throw new TypeError('Do not know how to serialize a BigInt')
    default:
      return String(value)
  }
}

export default function stringify(value, replacer, space, keyCompare) {
  let indent = ''
  if (typeof space === 'number') {
    indent = ' '.repeat(Math.min(space, 10))
  } else if (typeof space === 'string') {
    indent = space.slice(0, 10)
  }
  const ctx = {
    gap: '',
    indent,
    rep: typeof replacer === 'function' ? replacer : undefined,
    keys: Array.isArray(replacer) ? replacer : undefined,
    cmp: typeof keyCompare === 'function' ? keyCompare : undefined,
    seen: new Set()
  }
  return str('', { '': value }, ctx)
}
