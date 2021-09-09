
module.exports = user_preset_config = {
    "diary": {
        "1630996383833": {
            "backgroundColor": 14,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995763300",
                            "constant": null
                        }
                    ],
                    "color": 2,
                    "isOut": true,
                    "key": "1",
                    "postfix": "Уд/мин"
                }, {
                    "variables": [{
                            "name": "1630995906100",
                            "constant": null
                        }
                    ],
                    "color": 13
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Сердцебиение и сатурация",
            "wide": false
        },
        "1630996617585": {
            "backgroundColor": 4,
            "chartType": 1,
            "chartValues": [{
                    "variables": [{
                            "name": "1630996090449",
                            "constant": null
                        }
                    ],
                    "color": 3,
                    "isOut": true,
                    "key": "1",
                    "postfix": "-"
                }, {
                    "variables": [{
                            "name": "1630996108516",
                            "constant": null
                        },
                        {
                            "name": null,
                            "pre": "*",
                            "constant": -1
                        }
                    ],
                    "color": 0,
                    "isOut": true,
                    "postfix": "="
                }, {
                    "variables": [{
                            "name": "1630996090449",
                            "constant": null
                        }, {
                            "pre": "-",
                            "name": "1630996108516",
                            "constant": null
                        }
                    ],
                    "color": 6,
                    "isOut": true,
                    "postfix": "мл"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Водный баланс",
            "wide": true
        },
        "1630996673449": {
            "backgroundColor": 3,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995981550",
                            "constant": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1",
                    "postfix": "/"
                }, {
                    "variables": [{
                            "name": "1630996003416",
                            "constant": null
                        }
                    ],
                    "color": 5,
                    "isOut": true
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Давление",
            "wide": true
        },
        "1630996723799": {
            "backgroundColor": 1,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995855883",
                            "constant": null
                        }
                    ],
                    "color": 2,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Температура",
            "wide": true
        },
        "1630996785719": {
            "backgroundColor": 6,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995828816",
                            "constant": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Рост",
            "wide": true
        },
        "1630997069399": {
            "backgroundColor": 3,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995796983",
                            "constant": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Вес",
            "wide": true
        },
        "1630997150649": {
            "backgroundColor": 5,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630995796983",
                            "constant": null
                        }, {
                            "pre": "/",
                            "name": "1630995828816",
                            "constant": null
                        }, {
                            "pre": "/",
                            "name": "1630995828816",
                            "constant": null
                        }
                    ],
                    "color": 6,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "ИМТ",
            "wide": true
        },
        "1630997186250": {
            "backgroundColor": 6,
            "chartType": 0,
            "chartValues": [{
                    "variables": [{
                            "name": "1630996199466",
                            "constant": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Сахар",
            "wide": true
        },
        "1630997244350": {
            "backgroundColor": 3,
            "chartType": 2,
            "chartValues": [{
                    "variables": [{
                            "name": "1630996041650",
                            "constant": null
                        }, {
                            "pre": "/",
                            "constant": "300",
                            "name": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Активность",
            "wide": true
        },
        "1630997280516": {
            "backgroundColor": 7,
            "chartType": 2,
            "chartValues": [{
                    "variables": [{
                            "name": "1630996055866",
                            "constant": null
                        }, {
                            "pre": "/",
                            "constant": "10000",
                            "name": null
                        }
                    ],
                    "color": 4,
                    "isOut": true,
                    "key": "1"
                }
            ],
            "aggChart": 0,
            "timeMode": 0,
            "title": "Шаги",
            "wide": true
        }
    },
    "variables": {
        "1630995763300": {
            "icon": "faHamburger",
            "color": 2,
            "limit_min": "40",
            "limit_max": "240",
            "locale": {
                "ru": "ЧСС"
            }
        },
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
        "1630996041650": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "0",
            "limit_max": "10000",
            "locale": {
                "ru": "Активность"
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
        "1630996199466": {
            "icon": "faHamburger",
            "color": 0,
            "limit_min": "2",
            "limit_max": "6",
            "locale": {
                "ru": "Сахар"
            }
        }
    }
    
};