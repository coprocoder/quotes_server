// нормализованная структура
// имитация БД
const users = {
//   1: { username: "Alice", online: false },
//   2: { username: "Bob", online: false },
};

module.exports = (io, socket) => {
  // обрабатываем запрос на получение пользователей
  const getUsers = async () => {
    console.log('socket getUsers', users)
    io.in(socket.chatId).emit("users", users);
  };
  

  // обрабатываем добавление пользователя
  // функция принимает объект с именем пользователя и его id
  const addUser = ({ username }) => {
    console.log('socket addUser', username, users)
    // проверяем, имеется ли пользователь в БД
    if (!users[username]) {
      // если не имеется, добавляем его в БД
      users[username] = { username, online: true };
    } else {
      // если имеется, меняем его статус на онлайн
      users[username].online = true;
    }
    // выполняем запрос на получение пользователей
    getUsers();
  };

  // обрабатываем удаление пользователя
  const removeUser = (username) => {
    console.log('socket removeUser', username)
    users[username].online = false;
    getUsers();
  };

  // регистрируем обработчики
  socket.on("user:get", getUsers);
  socket.on("user:add", addUser);
  socket.on("user:leave", removeUser);
};
