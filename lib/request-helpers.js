'use strict'

const uuid = require('uuid/v4')
const round = require('lodash/round')
const hasha = require('hasha')
const createHmac = require('create-hmac')
const credentials = require('../credentials.json')

const requestHashesForCredentials = ({ token, secret, nonce: _nonce }) => ({ url, isoDate: _isoDate }) => {
	const method = 'GET' // @todo
	const separator = ':'

	const nonce = _nonce || uuid()
	const isoDate = _isoDate || new Date().toISOString()
	const timestamp = round(+new Date(isoDate) / 1000) + ''

	// first stage
	const first = [url, method, ''].join(separator)
	const hashedFirst = hasha(first, { algorithm: 'sha1', encoding: 'base64' })

	// second stage
	const second = [
		'appun',
		token,
		secret,
		timestamp,
		nonce,
		hashedFirst,
	].join(separator)
	const hmac = createHmac('sha256', secret)
	hmac.update(second)
	const mac = hmac.digest('base64')

	return {
		id: token,
		nonce,
		timestamp,
		mac,
	}
}

const authorizationHeader = ({ token, timestamp, nonce, mac }) => `Mac id="${token}", ts="${timestamp}", nonce="${nonce}", mac="${mac}"`

module.exports = {
	requestHashesForCredentials,
	requestHashes: requestHashesForCredentials(credentials),
	authorizationHeader,
}
