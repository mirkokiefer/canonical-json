[![npm version](https://img.shields.io/npm/v/canonical-json.svg)](https://www.npmjs.com/package/canonical-json)
[![tests](https://github.com/mirkokiefer/canonical-json/actions/workflows/test.yml/badge.svg)](https://github.com/mirkokiefer/canonical-json/actions)

# canonical-json - Deterministic JSON.stringify()

The goal of this module is to implement a version of `JSON.stringify` that returns a **deterministic**, **canonical JSON** format.

Canonical JSON means that the same object should always be stringified to the exact same string. JavaScript’s native `JSON.stringify` does not guarantee any order for object keys when serializing:

> Properties of non-array objects are not guaranteed to be stringified in any particular order. Do not rely on ordering of properties within the same object within the stringification.

Source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify

This module implements two alternative solutions to this problem:

- **stringify.js** is based on [Douglas Crockford's json2.js](https://github.com/douglascrockford/JSON-js/blob/master/json2.js). It’s modified to serialize object keys in sorted order on the fly.
- **stringify-copy.js** recursively creates a copy of the object with sorted keys, then passes it to native `JSON.stringify`.

_By default, this package exports the `index.js` version (`stringify`), and also provides `stringifyCopy` for the copy-based approach._

---

## Install

```bash
npm install canonical-json
```

## Usage

### ES Module

```js
import stringify, { stringifyCopy } from 'canonical-json'

const obj = { b: 2, a: 1, c: { y: 0, x: 9 } }
console.log(stringify(obj))       // {"a":1,"b":2,"c":{"x":9,"y":0}}
console.log(stringifyCopy(obj))   // same output via deep-copy approach
```

#### Custom Key Order

You can pass an optional comparator function to control key ordering:

```js
const obj = {
  first: 'a',
  second: 'b',
  third: 'c',
  fourth: 'd',
  last: 'foo'
}

const order = { first: 1, second: 2, third: 3, fourth: 4 }
const cmp = (a, b) => (order[a] || 9999) - (order[b] || 9999)

console.log(stringify(obj, undefined, undefined, cmp))
// {"first":"a","second":"b","third":"c","fourth":"d","last":"foo"}

console.log(stringifyCopy(obj, cmp))
// same result via copy-based serializer
```

### CommonJS

```js
const { default: stringify, stringifyCopy } = require('canonical-json')

console.log(stringify({ foo: 'bar', baz: 1 }))
```

---

## API

```ts
function stringify(
  value: any,
  replacer?: (key: string, value: any) => any,
  space?: string | number,
  keyCompare?: (a: string, b: string) => number
): string

function stringifyCopy(
  value: any,
  keyCompare?: (a: string, b: string) => number
): string

export default stringify
```

- **keyCompare**: optional comparator `(a, b) => number` for object key sorting.

---

## Performance Comparison

Tested on Node.js (2022 MacBook Air M2):

- **native `JSON.stringify`**: ~75 ms  
- **canonical `stringify.js`**: ~156 ms  
- **copy & native `stringify-copy.js`**: ~117 ms  

Performance test source: [test/performance.js](https://github.com/mirkokiefer/canonical-json/blob/master/test/performance.js)

---

## CLI

Use the `canonical-json` CLI to normalize JSON via stdin/stdout:

```bash
echo '{"b":2,"a":1}' | canonical-json > out.json
```

---

## Links

- [CANON](https://github.com/davidchambers/CANON) — similar canonical JSON project.

---

## Test

```bash
npm test
```

## License

MIT
