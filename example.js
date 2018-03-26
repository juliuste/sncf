'use strict'

const journeys = require('.').journeys

const frankfurt = 'DEFRA'
const lyon = 'FRLYS'
const london = 'GBLON'
const paris = 'FRPAR'

journeys(london, paris, new Date(), {duration: 24*60*60*1000})
.then(console.log)
.catch((err) => {
	console.error(err)
	process.exit(1)
})
