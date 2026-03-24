import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import stringify, { walk } from './index.js'
import { hash } from './hash.js'

describe('correctness', () => {
  it('flat object with default sort', () => {
    assert.equal(stringify({ b:2, a:1, c:3 }), '{"a":1,"b":2,"c":3}')
  })

  it('nested object with default sort', () => {
    const obj = { z:{ y:2, x:1 }, a:[ { b:1, a:0 }, 3 ] }
    assert.equal(stringify(obj), '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}')
  })

  it('flat object with custom comparator', () => {
    const obj = { first:'a', second:'b', third:'c', fourth:'d', last:'foo' }
    const order = { first:1, second:2, third:3, fourth:4 }
    const cmp = (a, b) => (order[a]||9999) - (order[b]||9999)
    assert.equal(stringify(obj, undefined, undefined, cmp), '{"first":"a","second":"b","third":"c","fourth":"d","last":"foo"}')
  })

  it('matches JSON.stringify for top-level non-serializable values', () => {
    assert.equal(stringify(undefined), JSON.stringify(undefined))
    assert.equal(stringify(() => 42), JSON.stringify(() => 42))
    assert.equal(stringify(Symbol('x')), JSON.stringify(Symbol('x')))
  })

  it('throws on BigInt values', () => {
    assert.throws(() => stringify(1n), TypeError)
  })
})

describe('boolean handling', () => {
  it('serializes true and false', () => {
    assert.equal(stringify(true), 'true')
    assert.equal(stringify(false), 'false')
  })

  it('serializes booleans in objects and arrays', () => {
    assert.equal(stringify({a: true, b: false}), '{"a":true,"b":false}')
    assert.equal(stringify([true, false]), '[true,false]')
  })

  it('serializes nested booleans', () => {
    const obj = {x: {deep: true}, y: [false, {z: true}]}
    assert.equal(stringify(obj), '{"x":{"deep":true},"y":[false,{"z":true}]}')
  })
})

describe('RFC 8785 compliance', () => {
  it('serializes -0 as 0', () => {
    assert.equal(stringify(-0), '0')
    assert.equal(stringify({a: -0}), '{"a":0}')
  })

  it('only escapes mandatory characters in strings', () => {
    // RFC 8785: only escape U+0000-U+001F, backslash, and double quote
    // Characters like U+00AD, U+200C etc must NOT be escaped
    assert.equal(stringify('\u00ad'), '"\u00ad"')
    assert.equal(stringify('\u200c'), '"\u200c"')
  })

  it('escapes control characters as \\uXXXX', () => {
    assert.equal(stringify('\u0000'), '"\\u0000"')
    assert.equal(stringify('\u001f'), '"\\u001f"')
  })

  it('uses shorthand escapes for common control chars', () => {
    assert.equal(stringify('\b'), '"\\b"')
    assert.equal(stringify('\t'), '"\\t"')
    assert.equal(stringify('\n'), '"\\n"')
    assert.equal(stringify('\f'), '"\\f"')
    assert.equal(stringify('\r'), '"\\r"')
  })

  it('sorts keys by UTF-16 code unit order', () => {
    const obj = { '\u00e9':'accent', 'a':'first', 'z':'last' }
    assert.equal(stringify(obj), '{"a":"first","z":"last","\u00e9":"accent"}')
  })

  it('number serialization matches ES6', () => {
    assert.equal(stringify(1e20), '100000000000000000000')
    assert.equal(stringify(1e21), '1e+21')
    assert.equal(stringify(0.1), '0.1')
    assert.equal(stringify(1/3), String(1/3))
  })
})

describe('circular reference detection', () => {
  it('throws on circular object', () => {
    const obj = { a: 1 }
    obj.self = obj
    assert.throws(() => stringify(obj), TypeError)
  })

  it('throws on circular array', () => {
    const arr = [1, 2]
    arr.push(arr)
    assert.throws(() => stringify(arr), TypeError)
  })

  it('allows repeated but non-circular references', () => {
    const shared = { x: 1 }
    assert.equal(stringify({ a: shared, b: shared }), '{"a":{"x":1},"b":{"x":1}}')
  })
})

describe('replacer support', () => {
  it('supports replacer function', () => {
    const obj = { a:1, b:2, c:3 }
    const result = stringify(obj, (key, value) => key === 'b' ? undefined : value)
    assert.equal(result, '{"a":1,"c":3}')
  })

  it('supports replacer array', () => {
    const obj = { a:1, b:2, c:3 }
    assert.equal(stringify(obj, ['a', 'c']), '{"a":1,"c":3}')
  })

  it('supports space for indentation', () => {
    assert.equal(stringify({a:1}, null, 2), JSON.stringify({a:1}, null, 2))
  })

  it('caps space at 10', () => {
    assert.equal(stringify({a:1}, null, 20), JSON.stringify({a:1}, null, 10))
  })

  it('is reentrant — replacer calling stringify does not corrupt state', () => {
    const result = stringify({a: 1, b: 2}, (key, value) => {
      if (key === 'a') stringify({z: 99}, null, 2)
      return value
    }, 2)
    assert.equal(result, JSON.stringify({a: 1, b: 2}, null, 2))
  })
})

describe('walk', () => {
  function collect(value, keyCompare) {
    const chunks = []
    walk(value, chunk => chunks.push(chunk), keyCompare)
    return chunks
  }

  it('produces same output as stringify when joined', () => {
    const cases = [
      { b:2, a:1, c:3 },
      [1, 'two', true, null],
      { nested: { z:1, a:2 }, arr: [false, { x:0 }] },
      'hello',
      42,
      true,
      null,
    ]
    for (const value of cases) {
      assert.equal(collect(value).join(''), stringify(value))
    }
  })

  it('emits chunks incrementally (not one big string)', () => {
    const chunks = collect({ a:1, b: [2, 3] })
    assert.ok(chunks.length > 1)
  })

  it('detects circular references', () => {
    const obj = { a: 1 }
    obj.self = obj
    assert.throws(() => collect(obj), TypeError)
  })

  it('supports custom key comparator', () => {
    const order = { first:1, second:2 }
    const cmp = (a, b) => (order[a]||9999) - (order[b]||9999)
    assert.equal(collect({ second:'b', first:'a', last:'c' }, cmp).join(''), '{"first":"a","second":"b","last":"c"}')
  })

  it('skips undefined, function, and symbol values in objects', () => {
    assert.equal(collect({ a:1, b:undefined, c:()=>{}, d:Symbol(), e:2 }).join(''), '{"a":1,"e":2}')
  })

  it('serializes -0 as 0', () => {
    assert.equal(collect(-0).join(''), '0')
  })

  it('handles toJSON correctly', () => {
    const obj = { a: { toJSON() { return undefined } }, b: 1, c: new Date('2024-01-01') }
    assert.equal(collect(obj).join(''), stringify(obj))
  })
})

describe('hash', () => {
  it('produces consistent sha256 hash', () => {
    const h1 = hash({ b:2, a:1 })
    const h2 = hash({ a:1, b:2 })
    assert.equal(h1, h2)
    assert.equal(h1.length, 64) // hex sha256
  })

  it('different objects produce different hashes', () => {
    assert.notEqual(hash({ a:1 }), hash({ a:2 }))
  })

  it('supports alternative algorithms', () => {
    const h = hash({ a:1 }, 'md5')
    assert.equal(h.length, 32) // hex md5
  })
})

describe('performance', () => {
  const count = 100000
  const objects = []
  for (let i = 0; i < count; i++) {
    objects.push({ a:Math.random(), b:'def', c:{ d:Math.random(), e:Math.random(), f:{ g:Math.random(), h:'abc' } } })
  }

  it('native JSON.stringify', () => {
    const before = Date.now()
    objects.forEach(o => JSON.stringify(o))
    console.log('native JSON.stringify:', Date.now() - before, 'ms')
  })

  it('canonical stringify', () => {
    const before = Date.now()
    objects.forEach(o => stringify(o))
    console.log('canonical stringify:', Date.now() - before, 'ms')
  })
})
