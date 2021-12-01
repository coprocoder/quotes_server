const express = require("express");
const router = express.Router();
const db = require("../db/db");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");
const ObjectID = require("mongodb").ObjectID;

router.post("/create", async (req, res, next) => {
  console.log("chat create CUR req.body", req.body);

  // async function generateUsersDict() {
  //   var users_dict = {};
  //   var chat_id = req.body.chat_id;
  //   console.log("CHAT chat_id", chat_id);
  //   let users = req.body.users_email_list;
  //   let users_refs = [];
  //   console.log("CHAT users", users);
  //   const promises = users.map(async (user_email, index) => {
  //     var filter = { "email._V": user_email };
  //     var get_fields = { _id: 1 };
  //     await db
  //       .get(db.users_database, db.users_collection, filter, get_fields)
  //       .then((get_results) => {
  //         console.log("CHAT get_results", get_results);
  //         console.log("CHAT get_results[0]._id", get_results[0]._id);
  //         console.log("CHAT ObjectID 1", new ObjectID(get_results[0]._id));
  //         console.log("CHAT ObjectID 2", new ObjectID(get_results[0]._id + ""));
  //         users_refs.push({
  //           $ref: "users",
  //           $id: new ObjectID(get_results[0]._id + ""),
  //           $db: "usersdb",
  //         });
  //       });
  //   });
  //   await Promise.all(promises);
  //   console.log("CHAT users_refs", users_refs);
  //   for (let i in users_refs) {
  //     users_dict[chat_id++] = users_refs[i];
  //   }
  //   return users_dict;
  // }
  // let users_dict = await generateUsersDict();
  // console.log("CHAT users_dict", users_dict);

  var chat_id = req.body.chat_id;
  var users_dict = {};
  for (let i in req.body.users_email_list) {
    users_dict[chat_id++] = req.body.users_email_list[i];
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

      for (let id in req.body.users_email_list) {
        var filter = { "email._V": req.body.users_email_list[id] };
        var get_fields = { "chats._V": 1 };

        // console.log('UPDATE CUR update_fields', update_fields)

        // Запись чата юзеру
        db.get(db.users_database, db.users_collection, filter, get_fields)
          .then((get_results) => {
            // console.log("chat create get_results 1", get_results);

            var filter = { "email._V": req.body.users_email_list[id] };
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

  let filter = { "email._V": req.body.email };
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
        .then(async (get_results) => {
          console.log("chat get get_results", get_results, typeof get_results);

          var chats_dict = {};

          // Проходимся по найденным чатам
          for (let i in get_results) {
            let chat = get_results[i];
            console.log("chat", chat);

            async function fillUsersInfoIntoChat() {
              let users_info_dict = {};

              // Дёргаем инфу о каждом юзере в чате
              const promises = Object.keys(chat.users).map(
                async (user_key, index) => {
                  var filter = { "email._V": chat.users[user_key] };
                  var get_fields = {
                    username: 1,
                    email: 1,
                    personal: 1,
                  };
                  await db
                    .get(
                      db.users_database,
                      db.users_collection,
                      filter,
                      get_fields
                    )
                    .then((get_results) => {
                      delete get_results[0]._id;
                      users_info_dict[user_key] = unwrap({
                        [val_key]: get_results[0],
                        [time_key]: null,
                      });
                    });
                }
              );
              await Promise.all(promises);
              console.log("CHAT filled chat", users_info_dict);

              return users_info_dict;
            }

            // заполняем инфу о юзерах в чате
            chat.users = await fillUsersInfoIntoChat();

            console.log("CHAT chat with users", chat);
            chats_dict[get_results[i].id] = chat;
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
