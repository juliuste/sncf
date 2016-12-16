'use strict'

const assert = require('assert')
const routes = require('./index').routes

routes('FRLPD', 'DEFRA')
.then((data) => assert.strictEqual(typeof data, 'object', 'Response is not an object'))
.catch(assert.ifError)