const db = require("../../db/db");
const messaging = require("../../routes/firebase/firebase_conf");
const { val_key, time_key, wrap, unwrap } = require("../../db/wrapper");

async function newChatNotification(chat_id, users_email_list) {
  console.log("addChatOnDevices", chat_id, users_email_list);

  let filter_initiator = { "email._V": users_email_list[0] };
  let get_initiator_fields = { personal: 1, username: 1 };
  let initiator = await db.get(db.users_database, db.users_collection, filter_initiator, get_initiator_fields);
  initiator = initiator[0];
  console.log("addChatOnDevices initiator", { initiator });

  let initiator_username = (!!initiator.username && unwrap(initiator.username)) || "";
  let initiator_personal = (!!initiator.personal && unwrap(initiator.personal)) || {};
  let initiator_fio =
    initiator_personal.firstName && initiator_personal.lastName
      ? initiator_personal.firstName + " " + initiator_personal.lastName
      : null;

  let notify_msg = {
    notification: {
      title: "Новый чат",
      body: initiator_fio || initiator_username || "",
    },
    data: {
      type: "new_chat",
      chat_id: String(chat_id),
    },
    android: {
      priority: "normal",
      notification: {
        tag: "new_chat", // Для показа только последнего сообщения
      },
    },
    apns: {
      headers: {
        "apns-priority": "5",
        "apns-collapse-id": "new_chat", // Для показа только последнего сообщения
      },
    },
    webpush: {
      headers: {
        Urgency: "normal",
      },
    },
  };

  for (let i in users_email_list) {
    // 0 = initiator
    if (i > 0) {
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
}

async function newChatMessageNotification(chatId, message) {
  console.log("sendNotification message", message);

  // Достаём инфу об отправителе сообщения
  var filter_sender = { "email._V": message.sender };
  var fields_sender = { username: 1, personal: 1 };
  let sender = await db.get(db.users_database, db.users_collection, filter_sender, fields_sender);
  console.log("sendNotification sender", sender);
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
    android: {
      priority: "normal",
      notification: {
        tag: "new_message", // Для показа только последнего сообщения
      },
    },
    apns: {
      headers: {
        "apns-priority": "5",
        "apns-collapse-id": "new_message", // Для показа только последнего сообщения
      },
    },
    webpush: {
      headers: {
        Urgency: "normal",
      },
    },
  };
  console.log("sendNotification msg", notify_msg);

  // Достаем список юзеров в чате (email)
  var filter_chat = { id: Number(chatId) };
  var fields_chat = { users: 1 };
  let chat_users = await db.get(db.users_database, db.chats_collection, filter_chat, fields_chat);
  chat_users = chat_users[0].users;
  console.log("sendNotification chat_users", chat_users);

  // Отправляем каждому в чате
  for (let i in chat_users) {
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
      });
    }
  }
}

module.exports = { newChatNotification, newChatMessageNotification };
