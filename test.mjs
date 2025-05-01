//var testObject = {a: 1, b: 'def', c: {d: 1, e: 2, f: {g: 1, h: 'abc'}}}
import stringify from './index.js'
const jsStringify = stringify

const timeFunction = function(fun) {
  const before = new Date().getTime();
  fun()
  const after = new Date().getTime();
  return after - before
}

const count = 100000
let objects

const createObjects = function() {
  objects = []
  for (let i=0; i<count; i++) {
    objects.push({a: Math.random(), b: 'def', c: {d: Math.random(), e: Math.random(), f: {g: Math.random(), h: 'abc'}}})
  }
}

const stringifyLotsOfTimes = function(stringify, objects) { return function() {
  for (let i=0; i<count; i++) {
    const result = stringify(objects[i])
  }
}}

const time0 = timeFunction(createObjects)
console.log('create objects:', time0)

const time1 = timeFunction(stringifyLotsOfTimes(JSON.stringify, objects))
console.log('native JSON.stringify:', time1)

const time2 = timeFunction(stringifyLotsOfTimes(jsStringify, objects))
console.log('js JSON.stringify:', time2)
