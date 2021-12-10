const express = require("express");
const router = express.Router();
const db = require("../db/db");
const messaging = require("./firebase/firebase_conf");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");

function checkExistChat(users_email_list, next) {
  let filter = { "email._V": users_email_list[0] };
  let get_fields = { "chats._V": 1 };

  // Получение списка id чатов собеседника
  return new Promise((resolve, reject) => {
    db.get(db.users_database, db.users_collection, filter, get_fields)
      .then(async (user_chats) => {
        let chats_id_list = (user_chats[0].chats && Object.values(unwrap(user_chats[0].chats))) || [];

        // Фильтрация чатов по юзеру (только те, в которые он добавлен)
        let filter = { id: { $in: chats_id_list } };
        let get_fields = { users: 1, id: 1 };

        // Получение чатов собеседника
        db.get(db.users_database, db.chats_collection, filter, get_fields)
          .then((get_chats_results) => {
            console.log("CHATS CREATE get_results", get_chats_results);
            let existed_chat_id = -1;

            // Проходимся по найденным чатам
            for (let i in get_chats_results) {
              let chat = get_chats_results[i];
              let chat_users_list = Object.values(chat.users);

              // Проверяем, существует ли уже чат с этими юзерами
              if (
                chat_users_list.length == 2 &&
                users_email_list.length === chat_users_list.length &&
                users_email_list.sort().every(function (value, index) {
                  return value === chat_users_list.sort()[index];
                })
              ) {
                existed_chat_id = chat.id;
              }
            }
            console.log("CHATS CREATE existed_chat_id", existed_chat_id);
            resolve(existed_chat_id);
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });
}

async function addChatOnDevices(chat_id, users_email_list) {
  console.log("addChatOnDevices", chat_id, users_email_list);

  let notify_msg = {
    data: {
      type: "new_chat",
      chat_id: String(chat_id),
    },
  };

  for (let i in users_email_list) {
    console.log("addChatOnDevices user email", users_email_list[i]);

    let filter_user = { "email._V": users_email_list[i] };
    let get_user_fields = { ["fb_token"]: 1 };
    db.get(db.users_database, db.users_collection, filter_user, get_user_fields).then((get_users_results) => {
      console.log("addChatOnDevices user data", get_users_results[0]);

      var registrationTokens = Object.values(get_users_results[0].fb_token);
      registrationTokens.forEach(async (token) => {
        let msg = { ...notify_msg, token: token };
        console.log("addChatOnDevices message", msg);
        messaging
          .send(msg)
          .then((response) => {
            console.log("Succesfully sent message:", response);
          })
          .catch((error) => {
            console.log("Error sending message:", error);
          });
        console.log("addChatOnDevices message 2");

        return res.send({}).status(200);
      });
    });
  }
}

router.post("/create", async (req, res, next) => {
  console.log("CHATS CREATE CUR req.body", req.body);

  addChatOnDevices(req.body.chat_id, req.body.users_email_list);

  // Проверяем наличие такого чата, где есть только эти юзеры
  let existed_chat_id = await checkExistChat(req.body.users_email_list, next);
  console.log("CHATS CREATE existed_chat_id on create", existed_chat_id);

  /*
    Если чат с этими юзерами есть, записываем себе его id
    Иначе создаем новый
  */
  if (existed_chat_id != -1) {
    console.log("== CHAT EXIST ===");
    res.send({
      message: "Чат уже существует",
      time: existed_chat_id,
      exist: true,
    });
  } else {
    console.log("== CHAT NEW ===");

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
              let user_chats = get_results.filter((item) => !!item.chats).map((item) => item.chats._V)[0] || {};
              if (Object.values(user_chats).indexOf(req.body.chat_id) === -1)
                user_chats[req.body.chat_id] = wrap(req.body.chat_id, req.body.chat_id);

              var update_fields = {
                ["chats._V"]: user_chats,
                ["chats._T"]: req.body.chat_id,
              };
              db.update(db.users_database, db.users_collection, filter, update_fields)
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
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  }
});

router.post("/get", (req, res, next) => {
  console.log("chat get CUR req.body", req.body);

  let filter = { "email._V": req.body.email };
  let get_fields = { "chats._V": 1 };

  // Получение списка id чатов юзера
  db.get(db.users_database, db.users_collection, filter, get_fields)
    .then((user_chats) => {
      console.log("user_chats", user_chats);
      let chats_id_list = (user_chats[0].chats && Object.values(unwrap(user_chats[0].chats))) || [];
      console.log("chats_id_list", chats_id_list);

      // Фильтрация чатов по юзеру (только те, в которые он добавлен)
      filter = { id: { $in: chats_id_list } };
      get_fields = {};

      // Получение чатов
      db.get(db.users_database, db.chats_collection, filter, get_fields)
        .then(async (get_results) => {
          // console.log("chat get get_results", get_results, typeof get_results);

          var chats_dict = {};

          // Проходимся по найденным чатам
          for (let i in get_results) {
            let chat = get_results[i];
            // console.log("chat", chat);

            async function fillUsersInfoIntoChat() {
              let users_info_dict = {};

              // Дёргаем инфу о каждом юзере в чате
              const promises = Object.keys(chat.users).map(async (user_key, index) => {
                var filter = { "email._V": chat.users[user_key] };
                var get_fields = {
                  username: 1,
                  email: 1,
                  personal: 1,
                };
                await db.get(db.users_database, db.users_collection, filter, get_fields).then((get_results) => {
                  delete get_results[0]._id;
                  users_info_dict[user_key] = unwrap({
                    [val_key]: get_results[0],
                    [time_key]: null,
                  });
                });
              });
              await Promise.all(promises);
              // console.log("CHAT filled chat", users_info_dict);

              return users_info_dict;
            }

            // заполняем инфу о юзерах в чате
            chat.users = await fillUsersInfoIntoChat();

            // console.log("CHAT chat with users", chat);
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

// router.post("/send_message", (req, res, next) => {
//   console.log("send_message CUR req.body", req.body);
//   var filter = { id: Number(req.body.chat_id) };
//   var servertime = new Date().getTime(); // Текущее время сервера
//   var update_fields = { ["messages." + servertime]: req.body.message };

//   db.update(db.users_database, db.chats_collection, filter, update_fields)
//     .then((results) => {
//       if (!!results) {
//         res.send({
//           message: "Данные обновлены",
//           time: servertime,
//         });
//       } else {
//         const err = new Error("Данные не обновлены!");
//         err.status = 400;
//         next(err);
//       }
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

module.exports = router;
