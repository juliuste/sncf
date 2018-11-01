'use strict'

const l = require('lodash')
const got = require('got')

const createStation = (s) => ({
	type: 'station',
	id: s.value,
	name: s.label
})

const defaults = {
	locale: 'fr-FR'
}

const endpoint = 'https://booking.oui.sncf/widget/autocomplete-d2d'

// todo: regions?

const stations = async (query, opt) => {
	opt = l.merge({}, defaults, opt || {})

	if (!query || typeof query !== 'string') throw new Error('query must be a string.')

	const results = await (got.get(endpoint, {
		json: true,
		query: {
			userCountry: opt.locale,
			searchField: 'origin',
			searchTerm: query
		}
	}).then(res => res.body))

	// todo: 'address', 'place'
	const stations = results.filter(r => r.category === 'station')
	return stations.map(createStation)
}

module.exports = stations
