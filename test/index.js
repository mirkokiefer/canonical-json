
var assert = require('assert')

var testModule = function(moduleName) {
  describe('stringify in module ' + moduleName, function() {
    var stringify = require('../' + moduleName)
    it('should output objects with sorted keys', function() {
      var object1 = [2, {a: 1, b: 2, c: 3, d: {c: 1, a: 2}}]
      var object2 = [2, {d: {a: 2, c: 1}, b: 2, a: 1, c: 3}]

      var json1 = stringify(object1)
      var json2 = stringify(object2)
      var expected = '[2,{"a":1,"b":2,"c":3,"d":{"a":2,"c":1}}]'
      assert.deepEqual(json1, expected)
      assert.deepEqual(json2, expected)
    })
  })
}

testModule('index')
testModule('index2')
