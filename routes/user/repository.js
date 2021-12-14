const jwt = require("jwt-simple");

const db = require("../../db/db");
const config = require("../../config/config");
const { val_key, time_key, wrap, unwrap } = require("../../db/wrapper");

module.exports.get = function (req, database, collection, next) {
  /*
    req.body ex: {
      "url":"field1.subfield",
      "time":"time"
    }
    IF client time == server time return {value:null, time:null}
    ELSE if < then return {value:db_value, time: db_time}
  */

  console.log("GET  req.body", req.body, database, collection);

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  var filter = { email: token_data.email };
  var fields = !!req.body.url ? { [req.body.url]: 1 } : {};

  return new Promise((resolve, reject) => {
    db.get(database, collection, filter, fields)
      .then((results) => {
        console.log("GET  results", results);

        // Достаём по url нужное вложенное поле из результата
        let results_found_field = results[0];
        let urls;

        // Проход по объекту юзера поиска нужного поля
        if (results_found_field) {
          if (!!req.body.url) {
            fields = { [req.body.url]: 1 };
            if (req.body.url.length > 0) {
              urls = req.body.url.split(".");
              for (i in urls) {
                if (results_found_field[urls[i]] != undefined) results_found_field = results_found_field[urls[i]];
              }
            }
          }
          console.log("GET  ans", results_found_field);

          if (!!results_found_field[val_key]) {
            if (req.body.time < results_found_field[time_key] || req.body.time == null) {
              for (key in results_found_field) resolve(results_found_field);
            } else {
              resolve({
                [val_key]: {},
                [time_key]: null,
              });
            }
          } else {
            resolve({
              [val_key]: {},
              [time_key]: null,
            });
          }
        } else {
          resolve({
            [val_key]: null,
            [time_key]: null,
          });
        }
      })
      .catch((err) => {
        next(err);
      });
  });
};

module.exports.update = function (req, database, collection, next) {
  /*
    req.body ex: {
      "url":"field1.subfield",
      "value":"value",
      "time":"time",      = время создания записи
      "devicetime":"time" = время отправки записи
    }
    IF time > db_time RETURN {code:0, time: time + (server_time - devicetime)
    ELSE if < RETURN {code:1, time: null}
  */

  console.log("UPDATE  req.body", req.body);

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");

  var filter = { email: token_data.email };
  var servertime = new Date().getTime(); // Текущее время сервера
  var actual_data_time = null;
  var update_fields = null;
  var get_fields = null;

  return new Promise((resolve, reject) => {
    // Преобразовываем входные данные в данные для NoSQL запроса
    if (!!req.body.url) {
      actual_data_time =
        req.body.devicetime - // Время сервера
        servertime + // Время отправки записи
        req.body.time; // Время создания записи
      update_fields = { [req.body.url]: req.body.value };
      get_fields = { [req.body.url]: 1 };
    } else {
      resolve({ code: -1, time: null, message: "Фильтр данных не задан" });
    }
    // console.log('UPDATE  update_fields', update_fields)

    db.get(database, collection, filter, get_fields)
      .then(async (get_results) => {
        // console.log('UPDATE  get_results', get_results)

        // Достаём нужное поле по URL
        let urls = req.body.url.split(".");
        let get_result_field = get_results[0];
        if (get_results.length > 0)
          for (i in urls) {
            if (get_result_field != undefined) {
              get_result_field = get_result_field[urls[i]];
            }
          }
        // console.log('UPDATE  get_result_field', get_result_field)

        // Если поле найдено, то обновляем его
        if (!!get_result_field) {
          // length > 1 т.к. при GET несуществующего объекта возвращается метаобъект с полем ID
          // Если данные на сервере не актуальны, то обновляем их
          if (get_result_field._T < req.body.time) {
            db.update(database, collection, filter, update_fields)
              .then((results) => {
                if (!!results) {
                  // Для динамической переавторизации при изменении email
                  // if (!!req.body.email)
                  //   req.session.user.email = req.body.email.value;
                  resolve({
                    message: "Данные обновлены",
                    code: 0,
                    time: get_result_field.time,
                  });
                } else {
                  const err = new Error("Данные не обновлены!");
                  err.status = 400;
                  next(err);
                }
              })
              .catch((err) => next(err));
          } else {
            resolve({
              message: "Данные не являются актуальными",
              code: 1,
              time: null,
            });
          }
        }

        // Если такого объекта или поля в базе нет, то создаём его
        else {
          db.update(database, collection, filter, update_fields)
            .then((results) => {
              if (!!results) {
                // Для динамической переавторизации при изменении email
                // if (!!req.body.email)
                //   req.session.user.email = req.body.email.value;
                resolve({
                  message: "Данные обновлены",
                  code: 0,
                  time: actual_data_time,
                });
              } else {
                const err = new Error("Данные не обновлены!");
                err.status = 400;
                next(err);
              }
            })
            .catch((err) => next(err));
        }

        // Обновляем время рядом с каждым _V (val_key)
        let time_url = urls[0];
        for (let i = 1; i < urls.length; i++) {
          // console.log('time_url', time_url, urls[i])
          if (urls[i] != val_key) {
            time_url = time_url + "." + val_key + "." + urls[i];
          } else {
            let cur_url = time_url + "." + time_key;
            let update_time_fields = { [cur_url]: req.body.time };
            // console.log('update_time_fields', update_time_fields)
            db.update(database, collection, filter, update_time_fields);
          }
        }
      })
      .catch((err) => next(err));
  });
};

module.exports.remove = function (req, database, collection, next) {
  /*
    req.body ex: {
      "url":"field1.subfield",
    }
  */

  console.log("REMOVE  req.body", req.body);

  let token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");

  let filter = { email: token_data.email };
  let remove_fields = { [req.body.url]: "" };

  return new Promise((resolve, reject) => {
    // Преобразовываем входные данные в данные для NoSQL запроса
    if (!!req.body.url) {
      get_fields = { [req.body.url]: 1 };
    } else {
      resolve({ code: -1, time: null, message: "Фильтр данных не задан" });
    }

    db.get(database, collection, filter, get_fields)
      .then(async (get_results) => {
        // console.log('REMOVE  get_results', get_results)

        // Достаём нужное поле по URL
        let urls = req.body.url.split(".");
        let get_result_field = get_results[0];
        if (get_results.length > 0)
          for (i in urls) {
            if (get_result_field != undefined) {
              get_result_field = get_result_field[urls[i]];
            }
          }
        // console.log('REMOVE  get_result_field', get_result_field)

        // Если поле найдено, то обновляем его
        if (!!get_result_field) {
          await db
            .remove(database, collection, filter, remove_fields)
            .then((results) => {
              if (!!results) {
                resolve({
                  message: "Данные удалены",
                  code: 0,
                });
              } else {
                const err = new Error("Данные не удалены!");
                err.status = 400;
                next(err);
              }
            })
            .catch((err) => {
              next(err);
            });
        }
        // Если такого объекта или поля в базе нет, то создаём его
        else {
          resolve({
            message: "Несуществующие данные не могут быть удалены",
            code: -1,
          });
        }
      })
      .catch((err) => {
        next(err);
      });
  });
};

module.exports.create = function (req, database, collection, data, next) {
  console.log("create req.body", req.body);
  return new Promise((resolve, reject) => {
    console.log("CREATE ", { data });
    db.create(database, collection, data)
      .then((results) => {
        resolve({
          message: "Данные добавлены",
          code: 0,
        });
      })
      .catch((err) => next(err));
  });
};
