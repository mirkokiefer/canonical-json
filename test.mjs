import stringify, { stringifyCopy } from './index.js'
import assert from 'assert'

function timeFunction(fn) {
  const before = Date.now();
  fn();
  return Date.now() - before;
}

describe('correctness', () => {
  it('flat object with default sort', () => {
    const obj = { b:2, a:1, c:3 }
    assert.strictEqual(stringify(obj), '{"a":1,"b":2,"c":3}')
    assert.strictEqual(stringifyCopy(obj), '{"a":1,"b":2,"c":3}')
  })

  it('nested object with default sort', () => {
    const obj = { z:{ y:2, x:1 }, a:[ { b:1, a:0 }, 3 ] }
    assert.strictEqual(
      stringify(obj),
      '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}'
    )
    assert.strictEqual(
      stringifyCopy(obj),
      '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}'
    )
  })

  it('flat object with custom comparator', () => {
    const obj = { first:'a', second:'b', third:'c', fourth:'d', last:'foo' }
    const order = { first:1, second:2, third:3, fourth:4 }
    const cmp = (a, b) => (order[a]||9999) - (order[b]||9999)
    const expected = '{"first":"a","second":"b","third":"c","fourth":"d","last":"foo"}'
    assert.strictEqual(stringify(obj, undefined, undefined, cmp), expected)
    assert.strictEqual(stringifyCopy(obj, cmp), expected)
  })
})

describe('performance', function() {
  this.timeout(0)
  const count = 100000
  const objects = []
  before(() => {
    for (let i = 0; i < count; i++) {
      objects.push({ a:Math.random(), b:'def', c:{ d:Math.random(), e:Math.random(), f:{ g:Math.random(), h:'abc' } } })
    }
  })

  it('native JSON.stringify', () => {
    console.log('native JSON.stringify:', timeFunction(() => objects.forEach(o => JSON.stringify(o))), 'ms')
  })

  it('canonical stringify', () => {
    console.log('stable-json-stringify:', timeFunction(() => objects.forEach(o => stringify(o))), 'ms')
  })

  it('copy stringify', () => {
    console.log('stringifyCopy:', timeFunction(() => objects.forEach(o => stringifyCopy(o))), 'ms')
  })
})