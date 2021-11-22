
module.exports = user_preset_config = {
    "diary": {
        "1634114490564": {
            "backgroundColor": 0,
            "chartType": 0,
            "chartValues": [
                {
                    "variables": [
                        {
                            "variable": {
                                "icon": "faHamburger",
                                "color": 7,
                                "limit_min": "40",
                                "limit_max": "220",
                                "locale": {
                                    "ru": "Частота сердцебиения"
                                }
                            },
                            "name": "1634114472907",
                            "constant": null
                        }
                    ],
                    "color": 0,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "ЧСС",
            "wide": false,
            "period": 2,
            "icon": "freq",
            "unit": "уд./мин."
        },
        "1634114605842": {
            "backgroundColor": 1,
            "chartType": 2,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995906100",
                            "constant": null
                        },
                        {
                            "pre": "/",
                            "constant": "100",
                            "name": null
                        },
                        {
                            "pre": "*",
                            "constant": "100",
                            "name": null
                        }
                    ],
                    "color": 1,
                    "useResult": true,
                    "suf": "%",
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "title": "Сатурация",
            "wide": false,
            "period": 0,
            "icon": "saturation",
            "unit": "%"
        },
        "1634114663398": {
            "backgroundColor": 2,
            "chartType": 0,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995981550",
                            "constant": null
                        }
                    ],
                    "color": 8,
                    "useResult": true,
                    "suf": "/",
                    "key": "1"
                },
                {
                    "variables": [
                        {
                            "name": "1630996003416",
                            "constant": null
                        }
                    ],
                    "color": 5,
                    "useResult": true
                }
            ],
            "title": "Давление",
            "wide": true,
            "period": 0,
            "icon": "pressure",
            "unit": "мм. рт. ст."
        },
        "1634114806981": {
            "backgroundColor": 3,
            "chartType": 2,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630996055866",
                            "constant": null
                        },
                        {
                            "pre": "/",
                            "constant": "10000",
                            "name": null
                        },
                        {
                            "pre": "*",
                            "constant": "100",
                            "name": null
                        }
                    ],
                    "color": 3,
                    "useResult": true,
                    "suf": "%",
                    "key": "1"
                }
            ],
            "title": "Шаги",
            "wide": false,
            "period": 0,
            "icon": "steps",
            "unit": "ед."
        },
        "1634115281395": {
            "backgroundColor": 4,
            "chartType": 1,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995855883",
                            "constant": null
                        }
                    ],
                    "color": 4,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "Температура",
            "wide": false,
            "period": 0,
            "icon": "temperature",
            "unit": "°C"
        },
        "1634115353627": {
            "backgroundColor": 5,
            "chartType": 1,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630996199466",
                            "constant": null
                        }
                    ],
                    "color": 5,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "Сахар",
            "wide": false,
            "period": 1,
            "icon": "glu",
            "unit": "ммоль/л"
        },
        "1634115451059": {
            "backgroundColor": 6,
            "chartType": 3,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995796983",
                            "constant": null
                        }
                    ],
                    "color": 6,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "Вес",
            "wide": false,
            "period": 2,
            "icon": "weight",
            "unit": "кг"
        },
        "1634115471433": {
            "backgroundColor": 7,
            "chartType": 3,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995828816",
                            "constant": null
                        }
                    ],
                    "color": 7,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "Рост",
            "wide": false,
            "period": 2,
            "icon": "height",
            "unit": "см"
        },
        "1634115521251": {
            "backgroundColor": 8,
            "chartType": 3,
            "chartValues": [
                {
                    "variables": [
                        {
                            "name": "1630995796983",
                            "constant": null
                        },
                        {
                            "pre": "/",
                            "name": "1630995828816",
                            "constant": null
                        },
                        {
                            "pre": "/",
                            "name": "1630995828816",
                            "constant": null
                        },
                        {
                            "pre": "*",
                            "name": null,
                            "constant": 10000
                        }
                    ],
                    "color": 8,
                    "useResult": true,
                    "key": "1"
                }
            ],
            "title": "ИМТ",
            "wide": false,
            "period": 2,
            "icon": "bmi",
            "unit": "кг/м²"
        }
    },
    "variables": {
        "1630995796983": {
            "icon": "faHamburger",
            "color": 6,
            "limit_min": "5",
            "limit_max": "350",
            "locale": {
                "ru": "Вес"
            }
        },
        "1630995828816": {
            "icon": "faHamburger",
            "color": 8,
            "limit_min": "30",
            "limit_max": "250",
            "locale": {
                "ru": "Рост"
            }
        },
        "1630995855883": {
            "icon": "faHamburger",
            "color": 1,
            "limit_min": "34",
            "limit_max": "42",
            "locale": {
                "ru": "Температура"
            }
        },
        "1630995906100": {
            "icon": "faHamburger",
            "color": 9,
            "limit_min": "60",
            "limit_max": "100",
            "locale": {
                "ru": "Сатурация"
            }
        },
        "1630995981550": {
            "icon": "faHamburger",
            "color": 6,
            "limit_min": "90",
            "limit_max": "200",
            "locale": {
                "ru": "Систолическое"
            }
        },
        "1630996003416": {
            "icon": "faHamburger",
            "color": 5,
            "limit_min": "40",
            "limit_max": "160",
            "locale": {
                "ru": "Диастолическое"
            }
        },
        "1630996055866": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "0",
            "limit_max": "10000",
            "locale": {
                "ru": "Шаги"
            }
        },
        "1630996199466": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "2",
            "limit_max": "6",
            "locale": {
                "ru": "Сахар"
            }
        },
        "1634114472907": {
            "icon": "faHamburger",
            "color": 2,
            "limit_min": "40",
            "limit_max": "240",
            "locale": {
                "ru": "ЧСС"
            }
        },
        "1630996090449": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "0",
            "limit_max": "1000",
            "locale": {
                "ru": "Ввод_воды"
            }
        },
        "1630996108516": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "0",
            "limit_max": "1000",
            "locale": {
                "ru": "Вывод_воды"
            }
        },
        "1630996041650": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "0",
            "limit_max": "10000",
            "locale": {
                "ru": "Активность"
            }
        },
    }  
};