# sncf

JavaScript client for the [sncf](https://www.voyages-sncf.com/) API. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format). *Still in progress.*

[![npm version](https://img.shields.io/npm/v/sncf.svg)](https://www.npmjs.com/package/sncf)
[![Build Status](https://travis-ci.org/juliuste/sncf.svg?branch=master)](https://travis-ci.org/juliuste/sncf)
[![dependency status](https://img.shields.io/david/juliuste/sncf.svg)](https://david-dm.org/juliuste/sncf)
[![dev dependency status](https://img.shields.io/david/dev/juliuste/sncf.svg)](https://david-dm.org/juliuste/sncf#info=devDependencies)
[![license](https://img.shields.io/github/license/juliuste/sncf.svg?style=flat)](LICENSE)
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

stations("Montpellier").then(console.log)
```

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows:

```js
[
    {
        type: 'station',
        id: 'FRMPL',
        name: 'Montpellier (FR)'
    }
    // …
]
```

### journeys(origin, destination, date = Date.now(), opt = defaults)

Using `sncf.journeys`, you can get directions and prices for routes from A to B. ***Still in progress!***

```js
const journeys = require('sncf').journeys

const francfort = 'DEFRA'
const lyon = 'FRLYS'
const date = new Date() // see also: opt parameter

journeys(francfort, lyon, date)
.then(console.log)
.catch(console.error)

journeys('FRPAR', 'FRLYS', new Date(), {duration: 24*60*60*1000})
```

`defaults`, partially overridden by the `opt` parameter, looks like this:

```js
const defaults = {
    duration: 6*60*60*1000, // searches for journeys in the next 6 hours starting at 'date' (parameter)
    direct: false, // direct connections only
    class: 2, // one of [1, 2]
    language: 'fr',
    busOnly: false
}
```

Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of `journey`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows.
*Note that the legs are not fully spec-compatible, as the `schedule` is missing in legs.*

```js
[
    {
        "type": "journey",
        "id": "8774c636-6f77-40e4-8399-f55550b5726c",
        "origin": {
            "type": "station",
            "id": "DEFRH",
            "name": "FRANKFURT MAIN HBF"
        },
        "destination": {
            "type": "station",
            "id": "FRLPD",
            "name": "LYON PART DIEU"
        },
        "departure": "2017-07-11T00:48:00.000Z", // JS Date() object
        "arrival": "2017-07-11T09:02:00.000Z", // JS Date() object
        "legs": [
            {
                "origin": {
                    "type": "station",
                    "id": "DEFRH",
                    "name": "FRANKFURT MAIN HBF"
                },
                "destination": {
                    "type": "station",
                    "id": "CHAJP",
                    "name": "BALE CFF"
                },
                "departure": "2017-07-11T00:48:00.000Z", // JS Date() object
                "arrival": "2017-07-11T04:22:00.000Z", // JS Date() object
                "vehicle": {
                    "type": "TRAIN"
                }
            },
            {
                "origin": {
                    "type": "station",
                    "id": "CHAJP",
                    "name": "BALE CFF"
                },
                "destination": {
                    "type": "station",
                    "id": "FRLPD",
                    "name": "LYON PART DIEU"
                },
                "departure": "2017-07-11T05:24:00.000Z", // JS Date() object
                "arrival": "2017-07-11T09:02:00.000Z", // JS Date() object
                "vehicle": {
                    "type": "TRAIN"
                }
            }
        ],
        "price": {
            "amount": 174.8,
            "currency": "EUR",
            "fares": [
                {
                    "price": {
                        "amount": 241.2,
                        "currency": "EUR"
                    },
                    "model": "UPSELL",
                    "appliedDiscount": 0,
                    "passengers": [
                        {
                            "clientId": "0",
                            "travelerId": null,
                            "price": 241.2,
                            "age": "ADULT",
                            "fidelityCard": "NONE",
                            "fidelityPoints": null,
                            "globalPassenger": false,
                            "promoCodeType": null,
                            "fareInformations": [
                                {
                                    "fareName": "Tarif normal Adulte",
                                    "fareCondition": "BILLET AVEC RESERVATION : échange et remboursement sans frais avant départ, 50% après départ. BILLET SANS RESERVATION : échange et remboursement avec 10% de retenue, avant et après départ .",
                                    "fareCode": "TRNO",
                                    "fareSpecificRule": null,
                                    "fareSequence": null,
                                    "cosLevel": null,
                                    "returnMandatory": false,
                                    "passengerType": "PT00AD",
                                    "classOfService": "A",
                                    "segmentId": 4,
                                    "passengerClientId": "0",
                                    "promoCodeApplied": false,
                                    "fixedPriceCuiQuotation": false,
                                    "fakeFare": false
                                },
                                {
                                    "fareName": "TGV LOISIR",
                                    "fareCondition": "Billet échangeable et remboursable avec retenue de 5 &euro; à compter de 30 jours avant le départ, portée à 15 &euro; la veille et le jour du départ.  A ces frais s'ajoute l'éventuelle différence de prix entre l'ancien et le nouveau billet.  Billet non échangeable et non remboursable après le départ.",
                                    "fareCode": "PR11",
                                    "fareSpecificRule": null,
                                    "fareSequence": null,
                                    "cosLevel": "06",
                                    "returnMandatory": false,
                                    "passengerType": "PT00AD",
                                    "classOfService": "AG",
                                    "segmentId": 5,
                                    "passengerClientId": "0",
                                    "promoCodeApplied": false,
                                    "fixedPriceCuiQuotation": false,
                                    "fakeFare": false
                                }
                            ],
                            "passengerType": "HUMAN",
                            "encartedPrems": false,
                            "specificSeatRequired": true,
                            "promoCodeApplied": false
                        }
                    ],
                    "animals": [],
                    "bookingFee": {
                        "amount": 5,
                        "currency": "EUR",
                        "type": "FDD"
                    },
                    "bicycle": false,
                    "placementOptions": true
                },
                {
                    "price": {
                        "amount": 174.8,
                        "currency": "EUR"
                    },
                    "model": "SEMIFLEX",
                    "appliedDiscount": 0,
                    "passengers": [
                        {
                            "clientId": "0",
                            "travelerId": null,
                            "price": 174.8,
                            "age": "ADULT",
                            "fidelityCard": "NONE",
                            "fidelityPoints": null,
                            "globalPassenger": false,
                            "promoCodeType": null,
                            "fareInformations": [
                                {
                                    "fareName": "Tarif normal Adulte",
                                    "fareCondition": "BILLET AVEC RESERVATION : échange et remboursement sans frais avant départ, 50% après départ. BILLET SANS RESERVATION : échange et remboursement avec 10% de retenue, avant et après départ .",
                                    "fareCode": "TRNO",
                                    "fareSpecificRule": null,
                                    "fareSequence": null,
                                    "cosLevel": null,
                                    "returnMandatory": false,
                                    "passengerType": "PT00AD",
                                    "classOfService": "B",
                                    "segmentId": 4,
                                    "passengerClientId": "0",
                                    "promoCodeApplied": false,
                                    "fixedPriceCuiQuotation": false,
                                    "fakeFare": false
                                },
                                {
                                    "fareName": "TGV LOISIR",
                                    "fareCondition": "Billet échangeable et remboursable avec retenue de 5 &euro; à compter de 30 jours avant le départ, portée à 15 &euro; la veille et le jour du départ.  A ces frais s'ajoute l'éventuelle différence de prix entre l'ancien et le nouveau billet.  Billet non échangeable et non remboursable après le départ.",
                                    "fareCode": "PR11",
                                    "fareSpecificRule": null,
                                    "fareSequence": null,
                                    "cosLevel": "01",
                                    "returnMandatory": false,
                                    "passengerType": "PT00AD",
                                    "classOfService": "BP",
                                    "segmentId": 5,
                                    "passengerClientId": "0",
                                    "promoCodeApplied": false,
                                    "fixedPriceCuiQuotation": false,
                                    "fakeFare": false
                                }
                            ],
                            "passengerType": "HUMAN",
                            "encartedPrems": false,
                            "specificSeatRequired": true,
                            "promoCodeApplied": false
                        }
                    ],
                    "animals": [],
                    "bookingFee": {
                        "amount": 5,
                        "currency": "EUR",
                        "type": "FDD"
                    },
                    "bicycle": false,
                    "placementOptions": true
                }
            ],
            "unsellableReason": null
        },
        "perturbations": false
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
