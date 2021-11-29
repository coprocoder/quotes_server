const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");

router.post("/create", (req, res, next) => {
  console.log("chat create CUR req.body", req.body);

  var chat_id = req.body.chat_id;
  var users_dict = {};
  for (let i in req.body.users) {
    users_dict[chat_id++] = req.body.users[i];
  }
  // console.log("chat users", users_dict);
  let chat_item = {
    id: req.body.chat_id,
    messages: {},
    users: users_dict,
  };
  // console.log("chat chat_item", chat_item);

  // Создаём чат
  db.create(db.users_database, db.chats_collection, chat_item)
    .then((results) => {
      //console.log("new chat results", results);

      for (let id in req.body.users) {
        var filter = { "email._V": req.body.users[id].email };
        var get_fields = { "chats._V": 1 };

        // console.log("chat create user", req.body.users[id]);

        // console.log('UPDATE CUR update_fields', update_fields)

        // Запись чата юзеру
        db.get(db.users_database, db.users_collection, filter, get_fields)
          .then((get_results) => {
            // console.log("chat create get_results 1", get_results);

            var filter = { "email._V": req.body.users[id].email };
            // console.log("chat create update filter", filter);
            let user_chats =
              get_results
                .filter((item) => !!item.chats)
                .map((item) => item.chats._V)[0] || [];
            user_chats.push(req.body.chat_id);

            var update_fields = {
              ["chats._V"]: user_chats,
              ["chats._T"]: req.body.chat_id,
            };
            db.update(
              db.users_database,
              db.users_collection,
              filter,
              update_fields
            )
              .then((results) => {
                if (!!results) {
                  res.send({
                    message: "Данные обновлены",
                    time: req.body.chat_id,
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
          })
          .catch((err) => {
            next(err);
          });
      }
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/get", (req, res, next) => {
  console.log("chat get CUR req.body", req.body);

  let filter = { "username._V": req.body.username };
  let get_fields = { "chats._V": 1 };

  // Получение списка id чатов юзера
  db.get(db.users_database, db.users_collection, filter, get_fields)
    .then((user_chats) => {
      // console.log("user_chats", user_chats);
      let chats_id_list =
        (user_chats[0].chats && unwrap(user_chats[0].chats)) || [];
      // console.log("chats_id_list", chats_id_list);

      // Фильтрация чатов по юзеру (только те, в которые он добавлен)
      filter = { id: { $in: chats_id_list } };
      get_fields = {};
      // Получение чатов
      db.get(db.users_database, db.chats_collection, filter, get_fields)
        .then((get_results) => {
          // console.log("chat get get_results", get_results, typeof get_results);

          let chats_dict = {};
          for (let i in get_results) {
            chats_dict[get_results[i].id] = get_results[i];
          }
          res.send(chats_dict);
        })
        .catch((err) => {
          next(err);
        });
    })
    .catch((err) => {
      next(err);
    });
});

router.post("/send_message", (req, res, next) => {
  console.log("send_message CUR req.body", req.body);

  // if (!!!req.headers.auth)
  //   res.send({
  //     time: null,
  //     message: "Операция доступна только авторизованным пользователям",
  //   });

  var filter = { id: Number(req.body.chat_id) };
  var servertime = new Date().getTime(); // Текущее время сервера
  var update_fields = { ["messages." + servertime]: req.body.message };

  db.update(db.users_database, db.chats_collection, filter, update_fields)
    .then((results) => {
      if (!!results) {
        res.send({
          message: "Данные обновлены",
          time: servertime,
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
});

module.exports = router;
