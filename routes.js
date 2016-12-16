'use strict'

const got = require('got')
const moment = require('moment')
const omit = require('lodash.omit')

const defaults = {
	class: 2,
	duration: 6 *60*60*1000
}

const parseSegment = (s) => s
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
	segments: j.segments.map(parseSegment)
	proposals: j.proposals.map(parseProposal)
	connections: j.connections.map(parseConnection)
})

const main = (from, to, date, options) => {
	options = Object.assign({}, defaults, options || {})
	date = new Date(date || Date.now())
	console.log(from, to, date, options)

	const result = got.post('https://europe.wshoraires.vsct.fr/m330/horaireetresasam/json/maqService/', {
		headers: {
			'X-HR-Version': '33.3',
			'X-Device-Type': 'IOS',
			'Content-Type': 'application/json;charset=UTF-8'
		},
		body: JSON.stringify({
			'MAQRequest': {
				'authorizedPayment': true,
				'directTravel': false,
				'travelClass': (options.class===1) ? 'FIRST' : 'SECOND',
				'departureTownCode': from,
				'pushOuibusWished': true,
				'outwardDate': date.toISOString(), // timezone?
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
	}).then((res) => JSON.parse(res.body))
	.then((data) => data.journeys.map(parseJourney))
	.then(console.log)
}

main('FRLPD', 'DEFRA')