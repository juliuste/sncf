'use strict'

const uuid = require('uuid/v4')
const Ajv = require('ajv')
const got = require('got')
const pick = require('lodash/pick')

const { devicePlatform, deviceType } = require('./lib/settings')

const createDeviceIdentifiers = () => {
	const login = uuid()
	const password = uuid()
	return {
		login,
		password,
		deviceIdentifier: login,
		devicePlatform,
		deviceType,
		anonymousUser: true
	}
}

const schema = {
	type: 'object',
	required: ['secret', 'token'],
	properties: {
		description: { format: 'uuid', nullable: false },
		secret: { format: 'uuid', nullable: false }
	}
}
const _validate = (new Ajv({ allErrors: true, nullable: true })).compile(schema)
const validate = obj => {
	const isValid = _validate(obj)
	if (!isValid) throw new Error('credentials do not match schema')
}

// authenticate the installation, fetch API credentials
// will be run as a postinstall step
const authenticate = async () => {
	const { body } = await got.post(`https://${devicePlatform}.appun-vsct.fr/authenticate/`, {
		json: true,
		body: createDeviceIdentifiers()
	})
	validate(body)
	console.error('successfully fetched credentials')
	return pick(body, ['secret', 'token'])
}

authenticate()
	.then(credentials => process.stdout.write(JSON.stringify(credentials, null, 4)))
	.catch(error => {
		console.error(error.message)
		console.error('failed to fetch credentials, please report this issue')
		process.exit(1)
	})
