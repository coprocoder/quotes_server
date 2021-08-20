
module.exports = widget_config = {
    /*
        "backgroundColor": 1,   // Цвет фона виджета
        "chartType": 0,         // Тип графика (линия, столб, прогресс, пирог)
        "chartValues": [{       // Переменные на графике
            "variables": [{
                "name": "2"
            }],
            "color": 6
        }],
        "title": "Температура", // Название виджета
        "outputFormat": "{0}",  // Формат данных для вывода
        "valueType": 0,         // Размер графика
        "wide": true            // хз
    */
    temperature: {
        "backgroundColor": 5,   
        "chartType": 0,         
        "chartValues": [{
            "variables": [{
                "name": "temperature"
            }],
            "color": 7
        }],
        "title": "Температура",
        "outputFormat": "{0}",
        "valueType": 0,
        "wide": true
    },
    pressure: {
        "backgroundColor": 8,
        "chartType": 0,
        "chartValues": [{
            "variables": [{
                "name": "pressure"
            }],
            "color": 4
        }],
        "title": "Давление",
        "outputFormat": "{0}/{1}",
        "valueType": 0,
        "wide": true
    },
    pulse: {
        "backgroundColor": 4,
        "chartType": 0,
        "chartValues": [{
            "variables": [{
                "name": "pulse"
            }],
            "color": 2
        }],
        "title": "ЧСС",
        "outputFormat": "{0}",
        "valueType": 0,
        "wide": true
    },
    sugar: {
        "backgroundColor": 0,
        "chartType": 0,
        "chartValues": [{
            "variables": [{
                "name": "sugar"
            }],
            "color": 6
        }],
        "title": "Уровень глюкозы",
        "outputFormat": "{0}",
        "valueType": 0,
        "wide": true
    }
}