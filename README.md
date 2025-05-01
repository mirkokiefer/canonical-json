[![npm version](https://img.shields.io/npm/v/canonical-json.svg)](https://www.npmjs.com/package/canonical-json)
[![tests](https://github.com/mirkokiefer/canonical-json/actions/workflows/test.yml/badge.svg)](https://github.com/mirkokiefer/canonical-json/actions)

# Canonical JSON

The goal of this module is to implement a version of `JSON.stringify` that returns a **canonical JSON** format.

Canonical JSON means that the same object should always be stringified to the exact same string. JavaScript’s native `JSON.stringify` does not guarantee any order for object keys when serializing:

> Properties of non-array objects are not guaranteed to be stringified in any particular order. Do not rely on ordering of properties within the same object within the stringification.

Source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/JSON/stringify

This module implements two alternative solutions to this problem:

- **stringify.js** is based on [Douglas Crockford's json2.js](https://github.com/douglascrockford/JSON-js/blob/master/json2.js). It’s modified to serialize object keys in sorted order on the fly.
- **copy-stringify.js** recursively creates a copy of the object with sorted keys, then passes it to native `JSON.stringify`.

_By default, this package exports the `index.js` version._

---

## Install

```bash
npm install canonical-json
```

## Usage

### ES Module

```js
import stringify from 'canonical-json'

const obj = { b: 2, a: 1, c: { y: 0, x: 9 } }
console.log(stringify(obj)) // {"a":1,"b":2,"c":{"x":9,"y":0}}
```

### CommonJS

```js
const stringify = require('canonical-json')

console.log(stringify({ foo: 'bar', baz: 1 }))
```

---

## Performance Comparison

Tested on Node.js (2022 MacBook Air M2):

- **native `JSON.stringify`**: ~75 ms  
- **canonical `stringify.js`**: ~156 ms  
- **copy & native `copy-stringify.js`**: ~117 ms  

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
