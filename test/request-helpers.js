'use strict'

const tapeWithoutPromise = require('tape')
const addPromiseSupport = require('tape-promise').default
const tape = addPromiseSupport(tapeWithoutPromise)

const { requestHashes, requestHashesForCredentials } = require('../lib/request-helpers')

tape('request helpers', async t => {
	const credentials = ({
		secret: 'b6f5d98d-184a-4a09-9f74-ed96b4aa1c77',
		token: '2648ef4e-1f70-4a6a-bf8b-cf9ecc0e1f4b',
		nonce: '1A4A4408-AAA6-410E-A4F0-AA45F09C8B9B',
	})
	const request = {
		url: 'https://ico.appun-vsct.fr/autocomplete/stationsTransport?q=montpellier',
		isoDate: '2019-09-29T21:11:32+02:00',
	}

	const requestHashesForGivenCredentials = requestHashesForCredentials(credentials)(request)
	t.deepEqual(requestHashesForGivenCredentials, {
		id: '2648ef4e-1f70-4a6a-bf8b-cf9ecc0e1f4b',
		timestamp: '1569784292',
		nonce: '1A4A4408-AAA6-410E-A4F0-AA45F09C8B9B',
		mac: 'EleNgTDX01SJHjeob+qz+Bjun0mYuKIkAGmnaX9SLLo=',
	})

	const requestHashesWithoutCredentialsOrDate = requestHashes({ url: request.url })
	t.ok(typeof requestHashesWithoutCredentialsOrDate.mac === 'string' && requestHashesWithoutCredentialsOrDate.mac.length >= 10)
})
