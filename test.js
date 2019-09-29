'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)

const sncf = require('.')

tape('sncf', async t => {
	t.ok(sncf)
})
