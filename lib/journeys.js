'use strict'

const got = require('got')
const merge = require('lodash.merge')
const omit = require('lodash.omit')
const moment = require('moment-timezone')
const toArray = require('lodash.toarray')
const minBy = require('lodash.minby')
const whilst = require('p-whilst')
const uniqBy = require('lodash.uniqby')
const isEmpty = require('lodash.isempty')

const defaults = {
    direct: false,
    class: 2,
    country: 'FR',
    language: 'fr',
    busOnly: false
}

const hashJourney = (j) => j.origin.id+j.destination.id+(+j.departure)+(+j.arrival)+j.legs.map((l) => l.origin.id+l.destination.id+(+l.departure)+(+l.arrival)+'')+''

const transformDate = (d) => moment.tz(d, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris').toDate()

// todo: return trip, passengers

const transformOptions = (o) => {
    const res = omit(o, ['class', 'direct'])

    // class
    if([1,2].indexOf(o.class)<0) throw new Error('class must be one of [1, 2]')
    res.travelClass = (o.class === 1) ? 'FIRST' : 'SECOND'

    res.directTravel = o.direct

    return res
}

const transformFare = (name, fare) => ({
    price: {
        amount: fare.amount,
        currency: fare.currency,
    },
    model: fare.type,
    appliedDiscount: fare.appliedDiscount,
    passengers: fare.passengerDetails,
    animals: fare.animalDetails,
    bookingFee: fare.bookingFee,
    bicycle: fare.hasBicycle || false,
    placementOptions: fare.hasPlacementOptions || false
})

const transformFares = (f) => {
    const res = []
    for(let key in f) res.push(transformFare(key, f[key]))
    return res
}

const transformLeg = (l) => ({
    origin: {
        type: 'station',
        id: l.originCode,
        name: l.origin
    },
    destination: {
        type: 'station',
        id: l.destinationCode,
        name: l.destination
    },
    departure: transformDate(l.departureDate),
    arrival: transformDate(l.arrivalDate),
    vehicle: {
        type: l.vehicleType
        // todo: traintype
    }
})

const transformJourney = (j) => ({
    type: 'journey',
    id: j.id,
    origin: {
        type: 'station',
        id: j.originCode,
        name: j.origin
    },
    destination: {
        type: 'station',
        id: j.destinationCode,
        name: j.destination
    },
    departure: transformDate(j.departureDate),
    arrival: transformDate(j.arrivalDate),
    legs: j.segments.map(transformLeg),
    price: {
        amount: (!isEmpty(j.priceProposals)) ? minBy(toArray(j.priceProposals), (o) => o.amount).amount : null,
        currency: (!isEmpty(j.priceProposals)) ?  minBy(toArray(j.priceProposals), (o) => o.amount).currency : null,
        fares: (!isEmpty(j.priceProposals)) ? transformFares(j.priceProposals) : [],
        unsellableReason: (j.unsellableReason === 'NONE') ? null : j.unsellableReason
    },
    perturbations: j.hasPerturbations
    // todo: j.transporters
})

const validStation = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

const journeys = (origin, destination, date, opt) => {
    date = moment.tz(new Date(date), 'Europe/Paris').format("YYYY-MM-DDTHH:mm:ss") // "2017-07-18T10:06:00"

    opt = transformOptions(merge({}, defaults, opt))

    const params = merge({
        "originCode": origin,
        "destinationCode": destination,
        "departureDate": date,

        "directTravel": false,
        "asymmetrical": false,
        "professional": false,
        "customerAccount": false,
        "oneWayTravel": true,
        "returnDate": null,
        "travelClass": "SECOND",
        "country": "FR",
        "language": "fr",
        "busBestPriceOperator": null,
        "busOnly": false,
        "passengers": [{"travelerId": null,"profile": "ADULT","age": 26,"birthDate": null,"fidelityCardType": "NONE","fidelityCardNumber": "","commercialCardNumber": null,"commercialCardType": "NONE","promoCode": ""}],
        "animals": [],
        "bike": "NONE",
        "withRecliningSeat": false,
        "physicalSpace": null,
        "fares": [],
        "withBestPrices": false,
        "highlightedTravel": null,
        "nextOrPrevious": false,
        "source": "SHOW_NEXT_RESULTS_BUTTON",
        "targetPrice": null,
        "$initial": false
    }, opt)

    return got.post('https://www.voyages-sncf.com/proposition/rest/search-travels/outward', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=utf-8',
            'X-VSD-SMART-GUY-GUARD': 'IudqfSdulN4;3:534:T4QQRZD',
            'X-VSD-LOCALE': 'fr_FR'
        },
        body: JSON.stringify(params),
        json: true
    })
    .then((res) => res.body)
    .then((res) => res.results)
    .then((journeys) => journeys.map(transformJourney))
}

const compareByDeparture = (a, b) => {
	a = +a.departure
	b = +b.departure
	return a - b
}


// taken from old script, debug!
const main = (origin, destination, date = Date.now(), options) => {
    if(!validStation(origin)) throw new Error('origin must be a valid station id')
    if(!validStation(destination)) throw new Error('destination must be a valid station id')

    date = new Date(date)

    options = merge({duration: 6*60*60*1000}, options)

    const end = +date + options.duration

	let currentStart = +date
	let allJourneys = []

	const condition = () => currentStart < end
	return whilst(condition, () =>
		journeys(origin, destination, currentStart, options)
		.then((journeys) => {
			journeys = journeys.filter((j) => +j.departure < end && +j.departure > currentStart)
			if (journeys.length === 0) {
				currentStart += 60 * 60 * 1000 // try later
			}
            else{
                allJourneys = allJourneys.concat(journeys).sort(compareByDeparture)

                const latestJourney = allJourneys[allJourneys.length - 1]
                const latestDeparture = +latestJourney.departure
                currentStart = latestDeparture + 60 * 1000
            }
		})
	).then(() => uniqBy(allJourneys, hashJourney))
}

module.exports = main
