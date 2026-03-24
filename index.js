import _stringify from './stringify.js'
import { stringifyCopy } from './stringify-copy.js'
export { walk } from './walk.js'

export default function stringify(value, replacer, space, keyCompare) {
  if (!replacer && !space) return stringifyCopy(value, keyCompare)
  return _stringify(value, replacer, space, keyCompare)
}
