'use strict'

const got = require('got')
const moment = require('moment')
const omit = require('lodash.omit')
const pick = require('lodash.pick')
const whilst = require('p-whilst')

const defaults = {
	class: 2,
	duration: 6 *60*60*1000
}

const parseClass = (c) => {
	if(c.toLowerCase()==='first') return 1
	else if(c.toLowerCase()==='second') return 2
	return null
}

const parseStation = (s) => ({
	name: s.stationName,
	code: s.resarailCodeCode,
	town: {
		name: s.townName,
		code: s.townRRCode
	}
})

const parseSegment = (s) => Object.assign(pick(s, [
	'trainType',
	'trainLabel',
	'trainCategory',
	'trainNumber',
	'trainPeriod',
	'reservationStatus',
	'placements',
	'fares',
	'placementOptions',
	'womenOnlyCompartment',
	'onboardServices'
]), {
	id: s.idSegment,
	class: parseClass(s.travelClass),
	from: parseStation(s.departureStation),
	to: parseStation(s.destinationStation),
	departure: new Date(s.departureDate),
	arrival: new Date(s.arrivalDate),
	duration: s.durationInMillis
})
const parseProposal = (p) => p
const parseConnection = (c) => c

const parseJourney = (j) => Object.assign(omit(j, [
		'journeyId',
		'duration',
		'durationInMillis',
		'segments',
		'proposals',
		'connections'
	]), {
	id: j.journeyId,
	duration: j.durationInMillis,
	segments: (j.segments || []).map(parseSegment),
	proposals: (j.proposals || []).map(parseProposal),
	connections: (j.connections || []).map(parseConnection),
})

const query = (from, to, date, _class) => {
	date = new Date(date).valueOf()
	return got.post('https://europe.wshoraires.vsct.fr/m330/horaireetresasam/json/maqService/', {
		headers: {
			'X-HR-Version': '33.3',
			'X-Device-Type': 'IOS',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify({
			'MAQRequest': {
				'authorizedPayment': true,
				'directTravel': false,
				'travelClass': _class===1 ? 'FIRST' : 'SECOND',
				'departureTownCode': from,
				'pushOuibusWished': true,
				'outwardDate': new Date(date).toISOString(), // timezone?
				'recliningSeats': false,
				'destinationTownCode': to,
				'passengers': [{
					'passengerType': 'HUMAN',
					'fidelityCode': 'NO_PROGRAM',
					'commercialCard': 'NO_CARD',
					'ageRank': 'ADULT'
				}],
				'passengerNbr': 1,
				'language': 'de',
				'alertResaWished': true,
				'country': 'DE',
				'fullTrainsWished': true
			}
		})
	})
	.then((res) => JSON.parse(res.body))
	.then((data) => {
		if (!data || !Array.isArray(data.journeys) || data.length === 0) return []
		// TODO: handle errors properly
		return data.journeys
		.map(parseJourney)
		.filter((route) => new Date(route.segments[0].departure).valueOf() >= date)
	})
}

const compareByDeparture = (a, b) => {
	a = new Date(a.segments[0].departure).valueOf()
	b = new Date(b.segments[0].departure).valueOf()
	return a - b
}

const main = (from, to, start, options) => {
	options = Object.assign({}, defaults, options || {})
	start = start ? new Date(start).valueOf() : Date.now()
	const end = start + options.duration

	let currentStart = start
	let allRoutes = []

	const condition = () => currentStart < end
	return whilst(condition, () =>
		query(from, to, currentStart, options.class)
		.then((routes) => {
			routes = routes.filter((r) => new Date(r.segments[0].departure).valueOf() < end)
			if (routes.length === 0) {
				currentStart += 60 * 60 * 1000 // try later
				return
			}

			allRoutes = allRoutes.concat(routes).sort(compareByDeparture)

			const latestRoute = allRoutes[allRoutes.length - 1]
			const latestDeparture = latestRoute.segments[0].departure
			currentStart = new Date(latestDeparture).valueOf() + 60 * 1000
		})
	).then(() => allRoutes)
}

module.exports = main