'use strict'

const l = require('lodash')
const moment = require('moment-timezone')
const validate = require('validate-fptf')
const tape = require('tape')
const sncf = require('./index')

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

		journeys.forEach(j => validate(j))

		t.ok(journeys[0].legs[0].origin.regions[0] === "DEFRA", 'origin region')
		t.ok(journeys[0].legs[journeys[0].legs.length-1].destination.regions[0] === "FRPAR", 'destination region')

		t.ok(['DB', 'SN'].includes(journeys[0].legs[0].operator), 'leg operator')

		t.ok(journeys[0].price.amount > 0, 'price amount')
		t.ok(journeys[0].price.currency === 'EUR', 'price currency')
		t.ok(journeys[0].price.fares.length > 0, 'price fares length')
		t.ok(journeys[0].price.fares[0].price.amount > 0, 'price fare price amount')
		t.ok(journeys[0].price.fares[0].price.currency === 'EUR', 'price fare price currency')

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
