const db = require("../db/db");
const messaging = require("../routes/firebase/firebase_conf");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");

async function sendNotification(chatId, message) {
  console.log("sendNotification message", message);

  // Достаём инфу об отправителе сообщения
  var filter_sender = { "email._V": message.sender };
  var fields_sender = { username: 1, personal: 1 };
  let sender = await db.get(db.users_database, db.users_collection, filter_sender, fields_sender);
  sender = sender[0];

  let sender_username = (!!sender.username && unwrap(sender.username)) || "";
  let sender_personal = (!!sender.personal && unwrap(sender.personal)) || {};
  let sender_fio =
    sender_personal.firstName && sender_personal.lastName
      ? sender_personal.firstName + " " + sender_personal.lastName
      : null;

  // Формируем сообщение для уведомления
  let notify_msg = {
    notification: {
      title: sender_fio || sender_username,
      body: message.content.text || "Вложение",
    },
    data: {
      type: "new_message",
    },
  };

  // Достаем список юзеров в чате (email)
  var filter_chat = { id: Number(chatId) };
  var fields_chat = { users: 1 };
  let chat_users = await db.get(db.users_database, db.chats_collection, filter_chat, fields_chat);
  chat_users = chat_users[0].users;

  // Отправляем каждому в чате
  for (let i in chat_users) {
    console.log("msg", chat_users[i], message);

    if (chat_users[i] !== message.sender) {
      let filter_user = { "email._V": chat_users[i] };
      let get_user_fields = { ["fb_token"]: 1 };
      db.get(db.users_database, db.users_collection, filter_user, get_user_fields).then((get_users_results) => {
        var registrationTokens = Object.values(get_users_results[0].fb_token);
        registrationTokens.forEach((token) => {
          let msg = { ...notify_msg, token: token };
          console.log("sendNotification message", msg);
          messaging
            .send(msg)
            .then((response) => {
              console.log("Succesfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
        });

        return res.send({}).status(200);
      });
    }
  }
}

module.exports = (io, socket) => {
  // обрабатываем запрос на получение сообщений
  const getMessages = async () => {
    // получаем сообщения из БД
    var filter = { id: +socket.chatId };
    var fields = { messages: 1 };
    const messages = await db.get(db.users_database, db.chats_collection, filter, fields).then((results) => {
      return results[0].messages;
    });
    console.log("socket messages", messages);

    io.in(socket.chatId).emit("messages", messages);
  };

  // обрабатываем добавление сообщения
  // функция принимает объект сообщения
  const addMessage = (message, time) => {
    console.log("socket addMessage", message);

    var filter = { id: Number(socket.chatId) };
    var update_fields = { ["messages." + time]: message };

    db.update(db.users_database, db.chats_collection, filter, update_fields)
      .then((results) => {
        if (!!results) {
          sendNotification(socket.chatId, message);
          res.send({
            message: "Данные обновлены",
            time: time,
          });
        } else {
          const err = new Error("Данные не обновлены!");
          err.status = 400;
          next(err);
        }
      })
      .catch((err) => next(err));

    io.in(socket.chatId).emit("messages:last", message, time);
  };

  //   // обрабатываем удаление сообщение
  //   // функция принимает id сообщения
  //   const removeMessage = (messageId) => {
  //     db.get("messages").remove({ messageId }).write();
  //     getMessages();
  //   };

  // регистрируем обработчики
  socket.on("message:get", getMessages);
  socket.on("message:add", addMessage);
  //   socket.on("message:remove", removeMessage);
};
