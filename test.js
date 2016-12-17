'use strict'

const assert = require('assert')
const {routes, places} = require('.')

routes('FRLPD', 'DEFRA')
.then((data) => assert.strictEqual(typeof data, 'object', 'Response is not an object'))
.catch(assert.ifError)

places('Lyon')
.then((results) => {
	assert.ok(Array.isArray(results), 'Response is not an array.')
	for (let result of results) {
		assert.strictEqual(typeof result.name, 'string', 'Name in result is not a string.')
		assert.strictEqual(typeof result.id, 'string', 'ID in result is not a string.')
	}
})
.catch(assert.ifError)