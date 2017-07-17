'use strict'

const moment = require('moment-timezone')
const isDate = require('lodash.isdate')
const tape = require('tape')
const sncf = require('./index')

const validStation = (s) => validID(s.id) && s.type==='station'

const validID = (s) => (/^[A-Z]+$/.test(s) && s.length === 5)

tape('sncf.stations', (t) => {
	sncf.stations('Frankfurt').then((stations) => {
		t.plan(4)
		t.ok(stations.length > 0, 'stations length')
		const ff = stations[0]
		t.ok(ff.type === 'station', 'station type')
		t.ok(ff.id === 'DEFRA', 'station id')
		t.ok(ff.name === 'Frankfurt (DE)', 'station name')
	})
	.catch((e) => {throw new Error(e)})
})

tape('sncf.journeys', (t) => {
	sncf.journeys("DEFRA", "FRPAR", moment.tz("Europe/Berlin").add(3, "days").startOf('day').add(7, "hours").toDate()).then((journeys) => {
		t.plan(13)

		t.ok(journeys.length > 0, 'journeys length')
		t.ok(journeys[0].type === 'journey', 'journey type')
		t.ok(journeys[0].id.length > 3, 'journey id')

		t.ok(journeys[0].legs.length > 0, 'journey legs length')
		t.ok(validStation(journeys[0].legs[0].origin), 'journey leg origin')
		t.ok(validStation(journeys[0].legs[0].destination), 'journey leg destination')
		t.ok(isDate(journeys[0].legs[0].departure), 'journey leg departure')
		t.ok(isDate(journeys[0].legs[0].arrival), 'journey leg arrival')

		t.ok(journeys[0].price.amount > 0, 'journey price amount')
		t.ok(journeys[0].price.currency === 'EUR', 'journey price currency')
		t.ok(journeys[0].price.fares.length > 0, 'journey price fares length')
		t.ok(journeys[0].price.fares[0].price.amount > 0, 'journey price fare price amount')
		t.ok(journeys[0].price.fares[0].price.currency === 'EUR', 'journey price fare price currency')
	})
	.catch((e) => {throw new Error(e)})
})

tape('sncf.prices', (t) => {
	sncf.prices("DEFRA", "FRPAR", moment.tz("Europe/Paris").add(1, "months").toDate()).then((prices) => {
		t.plan(4)

		t.ok(prices.length >= 28, 'prices length')
		t.ok(isDate(prices[0].date), 'price date')
		t.ok(prices[0].price.amount > 0, 'price price amount')
		t.ok(prices[0].price.currency === 'EUR', 'price price currency')
	})
	.catch((e) => {throw new Error(e)})
})
