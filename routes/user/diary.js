const express = require("express");
const router = express.Router();
const jwt = require("jwt-simple");

const db = require("../../db/db");
const config = require("../../config/config");
const db_operations = require("./repository");
const { val_key, time_key, wrap, unwrap } = require("../../db/wrapper");

// Get existed user
router.post("/get", async (req, res, next) => {
  await db_operations
    .get(req, db.users_database, db.diaries_collection, next)
    .then((data) => {
      console.log("DIARY get response", data);
      res.send(data);
    });
});

router.post("/update", async (req, res, next) => {
  await db_operations
    .update(req, db.users_database, db.diaries_collection, next)
    .then((data) => {
      console.log("DIARY update response", data);
      res.send(data);
    });
});

router.post("/remove", async (req, res, next) => {
  await db_operations
    .remove(req, db.users_database, db.diaries_collection, next)
    .then((data) => {
      console.log("DIARY remove response", data);
      res.send(data);
    });
});

// Fill profile diary random values
router.post("/autofill", (req, res, next) => {
  /*
    req.body: {
      count: <Int number> // Количество сгенерированных записей для добавления
      interval: <miliseconds>
    }
  */

  console.log("FILL DIARY req.body", req.body);

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  var filter = { email: token_data.email };

  var get_fields = {
    history: 1,
    variables: 1,
  };

  if (!!!req.body.count) {
    res.send({
      message: "Данные не обновлены. Укажите количество записей.",
      code: -1,
      time: Date.now(),
    });
  } else if (!!!req.body.interval) {
    res.send({
      message: "Данные не обновлены. Укажите интервал записей.",
      code: -2,
      time: Date.now(),
    });
  }

  db.get(db.users_database, db.diaries_collection, filter, get_fields)
    .then((get_results) => {
      // console.log('FILL DIARY get_results', get_results)

      let history = unwrap(get_results[0]["history"]);
      let variables = unwrap(get_results[0]["variables"]);

      let hist_keys_list = Object.keys(history);

      // Добавляем в историю значения в пределах лимитов из variable
      hist_keys_list = Object.keys(history);
      let history_addictions = {};
      for (let hist_key in hist_keys_list) {
        history_addictions[hist_keys_list[hist_key]] = {};
      }

      let new_time = Date.now();
      for (let i = 1; i < Number(req.body.count) + 1; i++) {
        new_time -= Number(req.body.interval);
        // console.log('FILL DIARY new_time', new_time)
        for (let hist_key in hist_keys_list) {
          // Достаём данные о переменной истории
          let variable = variables[hist_keys_list[hist_key]];
          let limit_min = Number(variable.limit_min);
          let limit_max = Number(variable.limit_max);

          // Находим её диапазон значений (макс - мин)
          let var_limit_sum = limit_max - limit_min;

          // Генерируем случайное значение в этом диапазоне
          let new_hist_val = Number(
            Math.random() * var_limit_sum + limit_min
          ).toFixed(0);

          history_addictions[hist_keys_list[hist_key]][new_time] = {
            value: Number(new_hist_val),
            time: new_time,
          };
        }
      }
      res.send({
        items: history_addictions,
        time: Date.now(),
      });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
