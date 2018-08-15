# sncf

JavaScript client for the [sncf](https://www.voyages-sncf.com/) API. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format). Inofficial, using endpoints by *SNCF*. Ask them for permission before using this module in production. *Work in progress.*

[![npm version](https://img.shields.io/npm/v/sncf.svg)](https://www.npmjs.com/package/sncf)
[![Build Status](https://travis-ci.org/juliuste/sncf.svg?branch=master)](https://travis-ci.org/juliuste/sncf)
[![Greenkeeper badge](https://badges.greenkeeper.io/juliuste/sncf.svg)](https://greenkeeper.io/)
[![dependency status](https://img.shields.io/david/juliuste/sncf.svg)](https://david-dm.org/juliuste/sncf)
[![license](https://img.shields.io/github/license/juliuste/sncf.svg?style=flat)](LICENSE)
[![fptf version](https://fptf.badges.juliustens.eu/badge/juliuste/sncf)](https://fptf.badges.juliustens.eu/link/juliuste/sncf)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```shell
npm install --save sncf
```

## Usage

This package contains data in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

### `stations(query)`

Using `sncf.stations`, you can search train stations operated by SNCF.

```js
const stations = require('sncf').stations

stations("Montpellier")
.then(console.log)
.catch(console.error)
```

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows:

```js
[
    {
        type: "station",
        id: "FRMPL",
        name: "Montpellier Saint-Roch (Occitanie)"
    }
    // …
]
```

### `journeys(origin, destination, date = new Date(), opt = {})`

Using `sncf.journeys`, you can get directions and prices for routes from A to B. `origin` and `destination` can be station `id`s or FPTF `station` objects.

```js
const journeys = require('sncf').journeys

const frankfurt = 'DEFRA'
const lyon = {type: 'station', id: 'FRLYS'}

journeys(frankfurt, lyon, new Date(), {duration: 24*60*60*1000})
.then(console.log)
.catch(console.error)
```

`defaults`, partially overridden by the `opt` parameter, looks like this:

```js
const defaults = {
    duration: 6*60*60*1000  // searches for journeys in the next 6 hours starting at 'date' (parameter). Warning: Spawns multiple requests, may take a couple of seconds for longer durations!
    direct: false,  // direct connections only
    class: 2, // one of [1, 2]
	via: null, // station code or object
	language: 'fr',
	country: 'FR', // probably influences price currency (?)
}
```

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of `journey`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows. Please note that the results are not fully spec-compatible since `arrival` and `departure` Date strings don't contain the station timezones, because the API doesn't provide this information.

```js
[
    {
        type: "journey",
        id: "3c9cb584-c16a-43ca-84fa-f89a610e9d82",
        legs: [
            {
                origin: "DEFRS",
                destination: "CHAJP",
                departure: "2018-03-27T04:02:00+01:00",
                arrival: "2018-03-27T07:20:00+01:00",
                line: {
                    type: "line",
                    id: "401",
                    name: "Train 401",
                    mode: "train",
                    vehicleType: "ONL",
                    services: [],
                    operator: "OE"
                },
                operator: "OE",
                schedule: "defrs-2018-03-27t04-02-00-01-00-chajp-2018-03-27t07-20-00-01-00"
            }
            // …
        ],
        price: {
            amount: 86,
            currency: "EUR",
            fares: [
                {
                    price: {
                        amount: 121,
                        currency: "EUR"
                    },
                    model: "SEMIFLEX",
                    appliedDiscount: 0,
                    passengers: [
                        {
                            clientId: "0",
                            travelerId: null,
                            price: 121,
                            age: "ADULT",
                            fidelityCard: "NONE",
                            fidelityPoints: null,
                            promoCodeType: null,
                            fareInformations: [
                                {
                                    fareName: "TARIF NORMAL ADULTE",
                                    fareCondition: "Billet remboursable sans frais jusqu'à 15 jours avant le départ, avec une pénalité de 50% à partir de 14 jours et jusqu'à 1 jours avant le départ. Billet non remboursable à partir de 1 jours avant le départ.",
                                    fareCode: "AFAD",
                                    fareSpecificRule: null,
                                    fareSequence: null,
                                    cosLevel: null,
                                    returnMandatory: false,
                                    passengerType: "PT00AD",
                                    classOfService: "B",
                                    segmentId: 6,
                                    passengerClientId: "0",
                                    promoCodeApplied: false,
                                    fixedPriceCuiQuotation: false,
                                    fakeFare: false
                                }
                                // …
                            ],
                            passengerType: "HUMAN",
                            encartedPrems: false,
                            specificSeatRequired: true,
                            hanInformation: null,
                            promoCodeApplied: false
                        }
                    ],
                    animals: [],
                    bookingFee: {
                        amount: 5,
                        type: "FDD"
                    },
                    bicycle: false,
                    placementOptions: true
                }
                // …
            ]
        },
        isRealTime: false
    }
    // …
]
```

----

## See also

- [FPTF](https://github.com/public-transport/friendly-public-transport-format) - "Friendly public transport format"
- [FPTF-modules](https://github.com/public-transport/friendly-public-transport-format/blob/master/modules.md) - modules that also use FPTF


## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/sncf/issues).
