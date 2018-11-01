'use strict'

const l = require('lodash')
const moment = require('moment-timezone')
const validate = require('validate-fptf')
const tape = require('tape')
const sncf = require('.')

const validID = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

tape('sncf.stations', (t) => {
	sncf.stations('Frankfurt').then((stations) => {
		stations.forEach(s => validate(s))
		t.ok(stations.length > 0, 'stations length')
		const [ff] = stations
		t.ok(ff.id === 'DEFRA', 'station id')
		t.ok(ff.name === 'Francfort (Frankfurt - toutes gares)', 'station name')
		t.end()
	})
	.catch(t.ifError)
})

tape('sncf.journeys', (t) => {
	sncf.journeys("DEFRA", "FRPAR", moment.tz("Europe/Paris").add(3, "days").startOf('day').add(7, "hours").toDate()).then(journeys => {
		t.ok(journeys.length > 0, 'journeys length')

		for (let journey of journeys) {
			validate(journey)

			t.ok(journey.legs[0].origin.substr(0, 3) === "DEF", 'origin')
			t.ok(journey.legs[journey.legs.length-1].destination.substr(0, 3) === "FRP", 'destination')

			t.ok(['DB', 'SN', 'CF'].includes(journey.legs[0].operator), 'leg operator')

			t.ok(journey.price.amount > 0, 'price amount')
			t.ok(journey.price.currency === 'EUR', 'price currency')
			t.ok(journey.price.fares.length > 0, 'price fares length')
			t.ok(journey.price.fares[0].price.amount > 0, 'price fare price amount')
			t.ok(journey.price.fares[0].price.currency === 'EUR', 'price fare price currency')
		}

		t.end()
	})
	.catch(t.ifError)
})

tape('sncf.prices', (t) => {
	sncf.prices("DEFRA", "FRPAR", moment.tz("Europe/Paris").add(1, "months").toDate()).then(prices => {
		t.ok(prices.length >= 28, 'prices length')
		t.ok(l.isDate(new Date(prices[0].date)) && +new Date(prices[0].date) > +new Date(), 'price date')
		t.ok(prices[0].price.amount > 0, 'price price amount')
		t.ok(prices[0].price.currency === 'EUR', 'price price currency')

		t.end()
	})
	.catch(t.ifError)
})
