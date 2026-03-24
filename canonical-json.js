#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import stringify from './index.js'
import { hash } from './hash.js'

const args = process.argv.slice(2)
const command = args[0] === 'hash' || args[0] === 'verify' ? args.shift() : null
const algoIdx = args.indexOf('--algo')
const algorithm = algoIdx !== -1 ? args.splice(algoIdx, 2)[1] : 'sha256'
const files = args.filter(a => !a.startsWith('-'))

function readInput() {
  if (files.length > 0) return files.map(f => ({ name: f, data: readFileSync(f, 'utf8') }))
  let data = ''
  const fd = readFileSync(0, 'utf8')
  return [{ name: null, data: fd }]
}

try {
  const inputs = readInput()
  for (const { name, data } of inputs) {
    const parsed = JSON.parse(data)
    if (command === 'hash') {
      const digest = hash(parsed, algorithm)
      console.log(files.length > 1 ? `${digest}  ${name}` : digest)
    } else if (command === 'verify') {
      const canonical = stringify(parsed)
      const isCanonical = data.trim() === canonical
      if (files.length > 1) {
        console.log(`${isCanonical ? 'ok' : 'fail'}  ${name}`)
      }
      if (!isCanonical) process.exitCode = 1
    } else {
      console.log(stringify(parsed))
    }
  }
} catch (e) {
  console.error(e.message)
  process.exitCode = 1
}
