'use strict'

const { stringify } = require('query-string')
const { get } = require('./request-helpers')
const concat = require('lodash/concat')

const { devicePlatform } = require('./settings')

// note that addresses don't contain any location information, so there is
// no FPTF type we could use for them
const createAddress = rawAddress => {
	return {
		type: 'address',
		id: rawAddress.id,
		name: rawAddress.shortLabel,
		longName: rawAddress.label,
	}
}

// note that, because the ids returned by the location search cannot be used
// for any station-related queries, we treat stations as POI here
// also, since we already had to expand the FPTF type set for addresses anyway,
// we also use a separate type for POIs
const createPoi = rawPoi => {
	// @todo expose rawPoi.transporters (lines at that station)
	return {
		type: 'poi',
		id: rawPoi.id,
		subType: rawPoi.type,
		location: {
			type: 'location',
			longitude: rawPoi.longitude,
			latitude: rawPoi.latitude,
		},
		name: rawPoi.label,
	}
}

// @todo add support for optional location bias (query.latitude, query.longitude)
const search = async query => {
	if (typeof query !== 'string' || query.length === 0) throw new Error('invalid input: `query` must be a non-empty string')

	const params = stringify({
		q: query,
	})
	const url = `https://${devicePlatform}.appun-vsct.fr/autocomplete/proposals?${params}`

	// @todo schema validation
	// @todo use flatten instead of manually listing the types here (but only if the schema is validated)
	const { addresses, trainStations, metroStations, tramStations, busStations } = await get(url)

	return concat(
		concat(trainStations, metroStations, tramStations, busStations).map(createPoi),
		addresses.map(createAddress),
	)
}

module.exports = { search }
