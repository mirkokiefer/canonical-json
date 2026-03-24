const escapable = /[\\\"\u0000-\u001f]/g
const meta = { '\b':'\\b', '\t':'\\t', '\n':'\\n', '\f':'\\f', '\r':'\\r', '"':'\\"', '\\':'\\\\' }

function quote(str) {
  return '"' + str.replace(escapable, a => meta[a] || ('\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4))) + '"'
}

function isSkippable(v) {
  return v === undefined || typeof v === 'function' || typeof v === 'symbol'
}

function resolve(value, key) {
  if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
    return value.toJSON(key)
  }
  return value
}

function emitValue(value, write, ctx) {
  if (value === null) { write('null'); return }
  switch (typeof value) {
    case 'string': write(quote(value)); return
    case 'number': write(isFinite(value) ? Object.is(value, -0) ? '0' : String(value) : 'null'); return
    case 'boolean': write(String(value)); return
    case 'undefined': case 'function': case 'symbol': return
    case 'bigint': throw new TypeError('Do not know how to serialize a BigInt')
    case 'object': break
    default: write(String(value)); return
  }

  if (ctx.seen.has(value)) throw new TypeError('Converting circular structure to JSON')
  ctx.seen.add(value)

  if (Array.isArray(value)) {
    write('[')
    for (let i = 0; i < value.length; i++) {
      if (i > 0) write(',')
      const item = resolve(value[i], String(i))
      if (isSkippable(item)) {
        write('null')
      } else {
        emitValue(item, write, ctx)
      }
    }
    write(']')
  } else {
    write('{')
    let first = true
    for (const k of Object.keys(value).sort(ctx.cmp)) {
      const v = resolve(value[k], k)
      if (isSkippable(v)) continue
      if (!first) write(',')
      write(quote(k))
      write(':')
      emitValue(v, write, ctx)
      first = false
    }
    write('}')
  }

  ctx.seen.delete(value)
}

export function walk(value, write, keyCompare) {
  const ctx = {
    cmp: typeof keyCompare === 'function' ? keyCompare : undefined,
    seen: new Set()
  }
  emitValue(resolve(value, ''), write, ctx)
}
