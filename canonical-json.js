#!/usr/bin/env node
import stringify from './index.js'
import { stdin, stdout } from 'process'

let data = ''
stdin.setEncoding('utf8')
stdin.on('data', chunk => data += chunk)
stdin.on('end', () => {
  stdout.write(stringify(JSON.parse(data)))
})