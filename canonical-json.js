#!/usr/bin/env node
import stringify from './index.js'

let data = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => data += chunk)
process.stdin.on('end', () => {
  try {
    console.log(stringify(JSON.parse(data)))
  } catch (e) {
    console.error(e.message)
    process.exitCode = 1
  }
})
