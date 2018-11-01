'use strict'

const l = require('lodash')
const got = require('got')
const moment = require('moment-timezone')

const endpoint = 'https://www.oui.sncf/calendar/cdp/api/public/calendar/v4/outward'

const defaults = {
	direct: false,
	class: 2,
	language: 'fr',
	currency: 'EUR',
	discount: '26-NO_CARD'
}

const validStation = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

// todo, hopefully the api provides timezone information in the future
// todo: check london
const transformDate = (d) => moment(d, 'YYYY-MM-DD').toISOString()

const transformRow = (r) => ({
	price: r.price ? {
		amount: r.price / 100,
		currency: 'EUR'
	} : null,
	date: transformDate(r.date)
})

const prices = async (origin, destination, date = new Date(), opt) => {
	if (l.isString(origin)) origin = { id: origin, type: 'station' }
	if (l.isString(destination)) destination = { id: destination, type: 'station' }

	if (!l.isString(origin.id) || !validStation(origin.id)) throw new Error('invalid or missing origin id')
	if (origin.type !== 'station') throw new Error('invalid or missing origin type, must be station')
	if (!l.isString(destination.id) || !validStation(destination.id)) throw new Error('invalid or missing destination id')
	if (destination.type !== 'station') throw new Error('invalid or missing destination type, must be station')

	origin = origin.id
	destination = destination.id

	if (!l.isDate(date)) throw new Error('date must be a JS date object')
	date = moment.tz(new Date(date), 'Europe/Paris').add(1, 'months').startOf('month').subtract(1, 'days').format('YYYY-MM-DD') // 2017-07-31

	const options = l.merge({}, defaults, opt)

	const results = await (got.get(`${endpoint}/${origin}/${destination}/${date}/${options.discount}/${options.class}/${options.language}?onlyDirectTrains=${options.direct}&currency=${options.currency}`, { json: true }).then(res => res.body))
	if (results.errorCode) {
		const err = new Error(results.description)
		err.statusCode = results.errorCode
		throw err
	}
	return results.map(transformRow)
}

module.exports = prices
