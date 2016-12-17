'use strict'

const got = require('got')

const parseResult = (r) => ({
	id: r.value,
	name: r.label
})

const places = (query, locale = 'en-WW') => {
	if (!query || typeof query !== 'string') throw new Error('query must be a string.')

	return got('http://booking.voyages-sncf.com/widget/autocomplete-file', {
		headers: {
			Accept: 'application/json'
		},
		query: {
			callback: 'foo',
			userCountry: locale,
			searchTerm: query
		}
	})
	.then((res) => {
		const jsonp = res.body
		// TODO: this is a very brittle way of parsing JSONP. find or build a module for this
		const json = jsonp.split('(').slice(1).join('(').split(')').slice(0, -1).join(')')
		const results = JSON.parse(json)
		if (!Array.isArray(results)) throw new Error('Response must be an array.')

		return results.map(parseResult)
	})
}

module.exports = places