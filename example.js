'use strict'

const sncf = require('.')

/* eslint-disable no-unused-vars */
// station id examples go here
/* eslint-enable no-unused-vars */

sncf.locations.search('Nîmes')
	.then(console.log)
	.catch(console.error)
