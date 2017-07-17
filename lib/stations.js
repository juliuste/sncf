'use strict'

const {fetch} = require('fetch-ponyfill')({Promise: require('pinkie-promise')})
const {stringify} = require('query-string')

const transformStation = (r) => ({
	type: 'station',
	id: r.value,
	name: r.label
})

const endpoint = 'http://booking.voyages-sncf.com/widget/autocomplete-file'

const stations = (query, locale = 'en-WW') => {
	if (!query || typeof query !== 'string') throw new Error('query must be a string.')

	return fetch(endpoint + '?' + stringify({
		callback: 'foo',
		userCountry: locale,
		searchTerm: query
	}), {
		headers: {
			Accept: 'application/json'
		},
		mode: 'cors',
		redirect: 'follow'
	})
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.text()
	})
	.then((jsonp) => {
		// TODO: this is a very brittle way of parsing JSONP. find or build a module for this
		const json = jsonp.split('(').slice(1).join('(').split(')').slice(0, -1).join(')')
		const results = JSON.parse(json)
		if (!Array.isArray(results)) throw new Error('Response must be an array.')

		return results.map(transformStation)
	})
}

module.exports = stations
