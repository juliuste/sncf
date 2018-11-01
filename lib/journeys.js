'use strict'

const l = require('lodash')
const got = require('got')
const moment = require('moment-timezone')
const whilst = require('p-whilst')
const slug = require('slugg')

const validStation = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

// todo, hopefully the api provides timezone information in the future
// todo: check london
const transformDate = (d) => moment(d, 'YYYY-MM-DDTHH:mm:ss').toISOString()

const transformFare = (name, fare) => ({
	price: {
		amount: fare.amount,
		currency: fare.currency
	},
	model: fare.type,
	appliedDiscount: fare.appliedDiscount,
	passengers: fare.passengerDetails,
	animals: fare.animalDetails,
	bookingFee: fare.bookingFee,
	bicycle: fare.hasBicycle || false,
	placementOptions: fare.hasPlacementOptions || false
})

const transformFares = (f) => {
	const res = []
	for (let key in f) res.push(transformFare(key, f[key]))
	return res
}

const hashLeg = (l) => [l.origin.id, l.departure, l.destination.id, l.arrival].join('_')
const hashJourney = (j) => j.legs.map(l => l.schedule).join('_')

const transformLeg = (l) => {
	const leg = {
		origin: l.originStationCode + '',
		destination: l.destinationStationCode,
		departure: transformDate(l.departureDate),
		arrival: transformDate(l.arrivalDate),
		line: {
			type: 'line',
			id: l.trainNumber,
			name: [l.transporter, l.trainNumber].join(' '),
			mode: (l.vehicleType || 'train').toLowerCase(), // todo
			vehicleType: l.trainType,
			// todo: trainPeriod?
			services: l.onboardServices,
			operator: l.carrierCode
		},
		operator: l.carrierCode
		// todo: other keys
	}
	leg.schedule = slug(hashLeg(leg))
	return leg
}

const transformJourney = (j) => ({
	type: 'journey',
	id: j.id,
	legs: j.segments.filter(l => l.originStationCode && l.destinationStationCode).map(transformLeg), // fixes weird empty-leg-bug
	price: (!l.isEmpty(j.priceProposals)) ? {
		amount: l.minBy(l.toArray(j.priceProposals), o => o.amount).amount,
		currency: l.minBy(l.toArray(j.priceProposals), o => o.amount).currency,
		fares: transformFares(j.priceProposals)
	} : null,
	isRealTime: !!j.realTimeInformations
	// todo: j.transporters?
})

const endpoint = 'https://www.oui.sncf/proposition/rest/search-travels/outward'

// todo: additional options like return trips?
const defaults = {
	via: null,
	direct: false,
	class: 2,
	language: 'fr',
	country: 'FR',
	duration: 6 * 60 * 60 * 1000
	// todo: passengers
	// todo: bike
	// todo: withBestPrices?
}

const journeys = async (origin, destination, date, opt) => {
	date = moment.tz(new Date(date), 'Europe/Paris').format('YYYY-MM-DDTHH:mm:ss') // todo

	const params = {
		origin, // content doesn't matter, just has to be non-empty, originally contained the station name
		originCode: origin,
		destination, // content doesn't matter, just has to be non-empty, originally contained the station name
		destinationCode: destination,
		viaCode: opt.via,
		directTravel: opt.direct,
		asymmetrical: false,
		professional: false,
		customerAccount: false,
		oneWayTravel: true,
		departureDate: date,
		returnDate: null,
		travelClass: (opt.class === 1) ? 'FIRST' : 'SECOND',
		country: opt.country,
		language: opt.language,
		busBestPriceOperator: null,
		passengers: [{
			travelerId: null,
			profile: 'ADULT',
			age: 26,
			birthDate: null,
			fidelityCardType: 'NONE',
			fidelityCardNumber: '',
			commercialCardNumber: null,
			commercialCardType: 'NONE',
			promoCode: '',
			lastName: null,
			firstName: null,
			phoneNumer: null,
			hanInformation: null
		}],
		animals: [],
		bike: 'NONE',
		withRecliningSeat: false,
		physicalSpace: null,
		fares: [],
		withBestPrices: true, // what does this do? website sets this to "false"
		highlightedTravel: null,
		nextOrPrevious: false,
		source: 'SHOW_NEXT_RESULTS_BUTTON',
		targetPrice: null,
		han: false,
		outwardScheduleType: 'BY_DEPARTURE_DATE',
		inwardScheduleType: 'BY_DEPARTURE_DATE',
		currency: null,
		companions: [],
		'$initial': false
	}

	const results = await (got.post(endpoint, {
		json: true,
		body: params
	}).then(res => res.body))

	const list = results.trainProposals.map(transformJourney)
	return list.filter(j => j.legs.length > 0) // fix weird empty-leg/journey bug
	// todo: error-handling
}

const compareByDeparture = (a, b) => {
	a = +new Date(a.legs[0].departure)
	b = +new Date(b.legs[0].departure)
	return a - b
}

// taken from old script, debug!
const main = (origin, destination, date = new Date(), opt) => {
	if (l.isString(origin)) origin = { id: origin, type: 'station' }
	if (l.isString(destination)) destination = { id: destination, type: 'station' }

	if (!l.isString(origin.id) || !validStation(origin.id)) throw new Error('invalid or missing origin id')
	if (origin.type !== 'station') throw new Error('invalid or missing origin type, must be station')
	if (!l.isString(destination.id) || !validStation(destination.id)) throw new Error('invalid or missing destination id')
	if (destination.type !== 'station') throw new Error('invalid or missing destination type, must be station')

	origin = origin.id
	destination = destination.id

	if (!l.isDate(date)) throw new Error('date must be a JS date object')
	date = new Date(date)

	// todo: option validation tests
	const options = l.merge({}, defaults, opt || {})

	if (options.via) {
		if (l.isString(options.via)) options.via = { id: options.via, type: 'station' }
		if (!l.isString(options.via.id) || !validStation(options.via.id)) throw new Error('invalid or missing options.via id')
		if (options.via.type !== 'station') throw new Error('invalid or missing options.via type, must be station')
		options.via = options.via.id
	}

	const end = +date + options.duration

	let currentStart = +date
	let allJourneys = []
	let endReached = false

	const condition = () => currentStart < end && !endReached
	return whilst(condition, () =>
		journeys(origin, destination, currentStart, options)
			.then(journeys => {
			// If any travel has a departure date after the end, it means that we have browsed all the departures
				endReached = journeys.some(j => +new Date(j.legs[0].departure) > end)

				journeys = journeys.filter(j =>
					+new Date(j.legs[0].departure) < end	&&
			+new Date(j.legs[0].departure) > currentStart
				)
				if (journeys.length === 0) {
					currentStart += 60 * 60 * 1000 // try later
				} else {
					allJourneys = allJourneys.concat(journeys).sort(compareByDeparture)
					const latestJourney = allJourneys[allJourneys.length - 1]
					const latestDeparture = +new Date(latestJourney.legs[0].departure)
					currentStart = latestDeparture + 60 * 1000
				}
			})
	)
		.then(() => l.uniqBy(allJourneys, hashJourney))
}

module.exports = main
