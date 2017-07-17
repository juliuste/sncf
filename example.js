'use strict'

const journeys = require('.').journeys

const frankfurt = 'DEFRA'
const lyon = 'FRLYS'

journeys(frankfurt, lyon, Date.now(), {language: 'en'})
.then(console.log)
.catch((err) => {
	console.error(err)
	process.exit(1)
})