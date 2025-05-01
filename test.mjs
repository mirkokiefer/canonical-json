import assert from 'assert';
import stringify from './index.js';

function timeFunction(fn) {
  const before = Date.now();
  fn();
  return Date.now() - before;
}

describe('canonical-json — correctness', () => {
  it('serializes a flat object with sorted keys', () => {
    const obj = { b: 2, a: 1, c: 3 };
    const out = stringify(obj);
    // keys must come out in alphabetical order
    assert.strictEqual(out, '{"a":1,"b":2,"c":3}');
  });

  it('serializes a nested object with sorted keys at each level', () => {
    const obj = {
      z: { y: 2, x: 1 },
      a: [ { b: 1, a: 0 }, 3 ]
    };
    const out = stringify(obj);
    // top‐level keys: a,z
    // in array, each object keys: a,b
    assert.strictEqual(
      out,
      '{"a":[{"a":0,"b":1},3],"z":{"x":1,"y":2}}'
    );
  });
});

describe('canonical-json — performance', function() {
  this.timeout(0); // allow long‐running benchmarks

  const count = 100_000;
  let objects;

  before(() => {
    objects = [];
    for (let i = 0; i < count; i++) {
      objects.push({
        a: Math.random(),
        b: 'def',
        c: {
          d: Math.random(),
          e: Math.random(),
          f: { g: Math.random(), h: 'abc' }
        }
      });
    }
  });

  it('native JSON.stringify', () => {
    const t = timeFunction(() => {
      for (const o of objects) JSON.stringify(o);
    });
    console.log('native JSON.stringify:', t, 'ms');
  });

  it('canonical-json.stringify', () => {
    const t = timeFunction(() => {
      for (const o of objects) stringify(o);
    });
    console.log('canonical-json stringify:', t, 'ms');
  });
});