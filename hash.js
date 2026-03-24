import { createHash } from 'node:crypto'
import { walk } from './walk.js'

export function hash(value, algorithm = 'sha256', keyCompare) {
  const h = createHash(algorithm)
  walk(value, chunk => h.update(chunk), keyCompare)
  return h.digest('hex')
}
