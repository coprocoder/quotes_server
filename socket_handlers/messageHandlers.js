const db = require("../db/db");
const { newChatMessageNotification } = require("../routes/firebase/repository");

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

    // Отправка сообщения в сокет
    io.in(socket.chatId).emit("messages:last", message, time);

    // Отправка уведомлений
    var filter = { id: Number(socket.chatId) };
    var update_fields = { ["messages." + time]: message };
    db.update(db.users_database, db.chats_collection, filter, update_fields).then((results) => {
      newChatMessageNotification(socket.chatId, message);
    });
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
