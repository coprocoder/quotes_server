// нормализованная структура
// имитация БД
const users = {
//   1: { username: "Alice", online: false },
//   2: { username: "Bob", online: false },
};

module.exports = (io, socket) => {
  // обрабатываем запрос на получение пользователей
  const getUsers = async () => {
    // var filter = {};
    // var fields = { "username": 1, "online": 1 };
    // const users = await db
    //   .get(db.users_database, db.users_collection, filter, fields)
    //   .then((results) => {
    //     return results;
    //   });
    io.in(socket.chatId).emit("users", users);
  };

  // обрабатываем добавление пользователя
  // функция принимает объект с именем пользователя и его id
  const addUser = ({ username, userId }) => {
    // проверяем, имеется ли пользователь в БД
    if (!users[userId]) {
      // если не имеется, добавляем его в БД
      users[userId] = { username, online: true };
    } else {
      // если имеется, меняем его статус на онлайн
      users[userId].online = true;
    }
    // выполняем запрос на получение пользователей
    getUsers();
  };

  // обрабатываем удаление пользователя
  const removeUser = (userId) => {
    users[userId].online = false;
    getUsers();
  };

  // регистрируем обработчики
  socket.on("user:get", getUsers);
  socket.on("user:add", addUser);
  socket.on("user:leave", removeUser);
};
