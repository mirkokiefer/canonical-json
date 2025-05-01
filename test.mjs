import stringify from './index.js'
import { stringifyCopy } from './index2.js'
import assert from 'assert'

function timeFunction(fn) {
  const before = Date.now();
  fn();
  return Date.now() - before;
}

// Correctness tests
const flat = { b:2, a:1, c:3 }
assert.strictEqual(stringify(flat), '{"a":1,"b":2,"c":3}')
assert.strictEqual(stringifyCopy(flat), '{"a":1,"b":2,"c":3}')

const nested = { z:{ y:2, x:1 }, a:[ { b:1, a:0 }, 3 ] }
assert.strictEqual(
  stringify(nested),
  '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}'
)
assert.strictEqual(
  stringifyCopy(nested),
  '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}'
)

// Performance tests
const count = 100000
let objects
before(() => {
  objects = []
  for (let i = 0; i < count; i++) {
    objects.push({ a: Math.random(), b:'def', c:{ d:Math.random(), e:Math.random(), f:{ g:Math.random(), h:'abc' } } })
  }
})

describe('Performance', function() {
  this.timeout(0)
  it('native JSON.stringify', () => {
    const t = timeFunction(() => objects.forEach(o => JSON.stringify(o)))
    console.log('native JSON.stringify:', t, 'ms')
  })

  it('canonical-json.stringify', () => {
    const t = timeFunction(() => objects.forEach(o => stringify(o)))
    console.log('canonical-json stringify:', t, 'ms')
  })

  it('canonical-json.stringifyCopy', () => {
    const t = timeFunction(() => objects.forEach(o => stringifyCopy(o)))
    console.log('canonical-json stringifyCopy:', t, 'ms')
  })
})