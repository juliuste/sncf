'use strict'

const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const merge = require('lodash.merge')
const moment = require('moment-timezone')

const endpoint = 'https://calendar.voyages-sncf.com/cdp/api/public/calendar/v4/outward'

const defaults = {
	direct: false,
	class: 2,
	language: 'fr',
	discount: '26-NO_CARD'
}

const validStation = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

const transformDate = (d) => moment.tz(d, 'YYYY-MM-DD', 'Europe/Paris').toDate()

const transformRow = (r) => ({
	price: r.price ? {
		amount: r.price/100,
		currency: 'EUR'
	} : null,
	date: transformDate(r.date)
})

const prices = (origin, destination, date = Date.now(), opt) => {
	if(!validStation(origin)) throw new Error('origin must be a valid station id')
	if(!validStation(destination)) throw new Error('destination must be a valid station id')

	date = moment.tz(new Date(date), 'Europe/Paris').add(1, 'months').startOf('month').subtract(1, 'days').format("YYYY-MM-DD") // 2017-07-31

	opt = merge({}, defaults, opt)

	return fetch(`${endpoint}/${origin}/${destination}/${date}/${opt.discount}/${opt.class}/${opt.language}?${opt.direct}`, {method: 'get'})
	.then((res) => {
		if(!res.ok){
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		const r = res.json()
		if(r.errorCode){
			const err = new Error(r.description)
			err.statusCode = r.errorCode
			throw err
		}
		return r
	})
	.then((data) => data.map(transformRow))
}

module.exports = prices
