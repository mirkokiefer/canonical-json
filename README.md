[![npm version](https://img.shields.io/npm/v/canonical-json.svg)](https://www.npmjs.com/package/canonical-json)
[![tests](https://github.com/mirkokiefer/canonical-json/actions/workflows/test.yml/badge.svg)](https://github.com/mirkokiefer/canonical-json/actions)

# canonical-json - Deterministic JSON.stringify()

A drop-in replacement for `JSON.stringify` that produces **deterministic**, **canonical JSON** output compliant with [RFC 8785 (JSON Canonicalization Scheme)](https://www.rfc-editor.org/rfc/rfc8785).

Ideal for content-addressable hashing, digital signatures, and distributed systems where identical objects must produce identical bytes.

## Install

```bash
npm install canonical-json
```

## Usage

```js
import stringify from 'canonical-json'

stringify({ b: 2, a: 1, c: { y: 0, x: 9 } })
// '{"a":1,"b":2,"c":{"x":9,"y":0}}'
```

### Replacer

Supports both function and array replacers, just like `JSON.stringify`:

```js
stringify({ a: 1, b: 2, c: 3 }, ['a', 'c'])
// '{"a":1,"c":3}'

stringify({ a: 1, b: 2 }, (key, value) => key === 'b' ? undefined : value)
// '{"a":1}'
```

### Indentation

```js
stringify({ a: 1 }, null, 2)
// '{\n  "a": 1\n}'
```

### Custom Key Order

Pass a comparator function as the fourth argument:

```js
const order = { first: 1, second: 2, third: 3 }
const cmp = (a, b) => (order[a] || 9999) - (order[b] || 9999)

stringify({ third: 'c', first: 'a', second: 'b' }, null, null, cmp)
// '{"first":"a","second":"b","third":"c"}'
```

## API

```ts
export default function stringify(
  value: any,
  replacer?: ((key: string, value: any) => any) | string[],
  space?: string | number,
  keyCompare?: (a: string, b: string) => number
): string | undefined
```

## RFC 8785 Compliance

When called without `replacer`, `space`, or `keyCompare`, the output conforms to [RFC 8785 (JCS)](https://www.rfc-editor.org/rfc/rfc8785):

- Object keys sorted by UTF-16 code unit order
- Numbers serialized per ES6 `Number.toString()` rules (`-0` becomes `0`)
- Only mandatory characters escaped (`U+0000`-`U+001F`, `"`, `\`)
- No whitespace

## CLI

```bash
echo '{"b":2,"a":1}' | canonical-json > out.json
```

## Test

```bash
npm test
```

Zero dependencies. Tests use Node's built-in test runner.

## License

MIT
