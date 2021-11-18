const db = require("../db/db");

module.exports = (io, socket) => {
  // обрабатываем запрос на получение сообщений
  const getMessages = async () => {
    // получаем сообщения из БД
    var filter = { "username.V": socket.selfUsername };
    var fields = { ["chats._V." + socket.chatId + ".messages"]: 1 };
    const messages = await db
      .get(db.users_database, db.users_collection, filter, fields)
      .then((results) => {
        return results;
      });

    // передаем сообщения пользователям, находящимся в комнате
    // синонимы - распространение, вещание, публикация
    io.in(socket.chatId).emit("messages", messages);
  };

//   // обрабатываем добавление сообщения
//   // функция принимает объект сообщения
//   const addMessage = (message) => {
//     db.get("messages")
//       .push({
//         // генерируем идентификатор с помощью nanoid, 8 - длина id
//         messageId: nanoid(8),
//         createdAt: new Date(),
//         ...message,
//       })
//       .write();

//     // выполняем запрос на получение сообщений
//     getMessages();
//   };

//   // обрабатываем удаление сообщение
//   // функция принимает id сообщения
//   const removeMessage = (messageId) => {
//     db.get("messages").remove({ messageId }).write();

//     getMessages();
//   };

  // регистрируем обработчики
  socket.on("message:get", getMessages);
//   socket.on("message:add", addMessage);
//   socket.on("message:remove", removeMessage);
};