const express = require("express");
const router = express.Router();
const db = require("../db/db");
const {
  val_key,
  time_key,
  wrap,
  unwrap,
} = require("../db/wrapper");

/* === Select fields from ALL === */

router.post("/find", (req, res, next) => {
  /*
    req.body ex: {
      "value": <find str>, // ex: Fam Nam Otch
    }
  */

  console.log("find user GET CUR req.body", req.body);

  let target_path_list = [
    "username._V",
    "personal._V.FirstName._V",
    "personal._V.MiddleName._V",
    "personal._V.LastName._V",
  ];
  let target_words = req.body.value.toLowerCase().split(" ");
  let query_fields = [];
  for (let word in target_words) {
    let filter_fields = [];
    for (let field in target_path_list)
      filter_fields.push({
        [target_path_list[field]]: {
          $regex: target_words[word],
          $options: "-i",
        },
      });
    query_fields.push({ $or: filter_fields });
  }
  // console.log('find user GET CUR query_fields', query_fields)

  var filter = { $and: query_fields };
  var fields = {
    email: 1,
    username: 1,
    personal: 1,
  };

  // console.log('find user GET CUR filter', filter)
  // res.send(filter);

  db.get(db.users_database, db.users_collection, filter, fields)
    .then((results) => {
      // console.log('find user GET CUR results', results)
      // console.log('unwrap', unwrap(results[0]))
      if (results.length)
        res.send(
          results.map((item) =>
            unwrap({
              [val_key]: item,
              [time_key]: null,
            })
          )
        );
      else res.send({});

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0];
      let urls;
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/add_friend", (req, res, next) => {
  /*
    req.body ex: {
      "url": "field1.subfield",
      "user": {email, username},
      "friend": {email, username},
    }
  */

  console.log("add_friend CUR req.body", req.body);

  // if (!!!req.headers.auth)
  //   res.send({
  //     time: null,
  //     message: "Операция доступна только авторизованным пользователям",
  //   });

  var filter = { "email._V": req.body.user.email };
  // var servertime = new Date().getTime(); // Текущее время сервера
  var chat_id = req.body.time;
  var update_fields = null;
  var get_fields = null;

  // Преобразовываем входные данные в данные для NoSQL запроса
  if (!!req.body.url) {
    update_fields = {
      // [req.body.url]: wrap(req.body.friend, servertime),
      [req.body.url]: wrap(req.body.friend, req.body.time),
    };
    get_fields = { [req.body.url]: 1 };
  } else {
    res.send({ time: null, message: "Фильтр данных не задан" });
  }
  // console.log('UPDATE CUR update_fields', update_fields)

  // Запись в друзья
  db.get(db.users_database, db.users_collection, filter, get_fields)
    .then((get_results) => {
      // console.log('UPDATE CUR get_results', get_results)

      // Достаём нужное поле по URL
      let urls = req.body.url.split(".");
      let get_result_field = get_results[0];
      if (get_results.length > 0)
        for (i in urls) {
          if (get_result_field != undefined) {
            get_result_field = get_result_field[urls[i]];
          }
        }
      console.log("add_friend get_result_field", get_result_field);

      // Если друг отсутствует
      if (!!!get_result_field) {
        db.update(db.users_database, db.users_collection, filter, update_fields)
          .then((results) => {
            if (!!results) {
              // Добавляем чат собеседнику
              let chat_url = "chats._V." + chat_id;
              db.update(
                db.users_database,
                db.users_collection,
                { "username._V": req.body.user.username },
                {
                  [chat_url]: wrap(
                    {
                      user: req.body.friend.username,
                      messages: { firstMessage: true },
                    },
                    chat_id
                  ),
                }
              );
              // Добавляем чат себе
              // db.update(
              //   db.users_database,
              //   db.users_collection,
              //   { "username._V": req.body.friend.username },
              //   {
              //     [chat_url]: wrap({
              //       user: req.body.user.username,
              //       messages: {firstMessage: true}
              //     }, servertime)
              //   }
              // );

              res.send({
                message: "Данные обновлены",
                time: req.body.tim,
                exist: false,
              });
            } else {
              const err = new Error("Данные не обновлены!");
              err.status = 400;
              next(err);
            }
          })
          .catch((err) => {
            next(err);
          });
      } else {
        // Если друг уже добавлен, отправляем его chat_id для добавления в локальное хранилище устройства
        console.log("friend exist", get_result_field);
        res.send({
          message: "Данные обновлены",
          time: unwrap(get_result_field).chat_id,
          exist: false,
        });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/send_message", (req, res, next) => {
  /*
    req.body ex: {
      "url": "field1.subfield",
      "user": {email, username},
      "friend": wrap {email, username},
    }
  */

  console.log("send_message CUR req.body", req.body);

  // if (!!!req.headers.auth)
  //   res.send({
  //     time: null,
  //     message: "Операция доступна только авторизованным пользователям",
  //   });

  var filter = { "username._V": req.body.user };
  var servertime = new Date().getTime(); // Текущее время сервера
  var actual_data_time = null;
  var update_fields = null;
  var get_fields = null;

  if (!!req.body.url) {
    actual_data_time =
      req.body.devicetime - // Время сервера
      servertime + // Время отправки записи
      req.body.time; // Время создания записи
    update_fields = { [req.body.url]: req.body.value };
    get_fields = { [req.body.url]: 1 };
  } else {
    res.send({ time: null, message: "Фильтр данных не задан" });
  }
  // console.log('UPDATE CUR update_fields', update_fields)

  db.get(db.users_database, db.users_collection, filter, get_fields)
    .then((get_results) => {
      // console.log('UPDATE CUR get_results', get_results)

      // Достаём нужное поле по URL
      let urls = req.body.url.split(".");
      let get_result_field = get_results[0];
      if (get_results.length > 0)
        for (i in urls) {
          if (get_result_field != undefined) {
            get_result_field = get_result_field[urls[i]];
          }
        }
      // console.log('UPDATE CUR get_result_field', get_result_field)

      db.update(db.users_database, db.users_collection, filter, update_fields)
        .then((results) => {
          if (!!results) {
            res.send({
              message: "Данные обновлены",
              time: actual_data_time,
            });
          } else {
            const err = new Error("Данные не обновлены!");
            err.status = 400;
            next(err);
          }
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

/* === FULL ITEMS BLOCK === */

// Create new user
router.post("/create", (req, res, next) => {
  console.log("CREATE ANY req.body", req.body);
  res.redirect(307, "../../auth/signup"); // 307 не меняет метод и тело при редиректе
});

// Delete existed user
router.post("/delete", (req, res, next) => {
  console.log("DELETE ANY req.body", req.body);

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  var filter = req.body;
  var fields = {};

  if (!!token_data && token_data.role == 0) {
    db
      // Ищем объект для удаления
      .get(db.users_database, db.users_collection, filter, fields)
      .then((get_results) => {
        // console.log('DELETE ANY USER results', get_results)
        db
          // Удаляем объекта из обычной БД
          .delete(db.users_database, db.users_collection, filter)
          .then((del_user_results) => {
            // Ищем в секретной БД связанный с юзером объект и удаляем его
            var secure_filter = { "user_id.value": get_results[0]._id };
            db.delete(db.secure_database, db.secure_collection, secure_filter)
              .then((del_secure_results) => {
                if (!!del_secure_results) {
                  res.send(del_secure_results);
                } else {
                  const err = new Error("Данные не найдены!");
                  err.status = 400;
                  next(err);
                }
              })
              .catch((err) => {
                next(err);
              });
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      });
  } else {
    const err = new Error("Нет прав на удаление!");
    err.status = 403;
    next(err);
  }
});

module.exports = router;
