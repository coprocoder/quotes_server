const db = require("../db/db");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");

module.exports = (io, socket) => {
  // обрабатываем запрос на получение сообщений
  const getMessages = async () => {
    // console.log("socket getMessages", socket.tsName, socket.chatId);
    console.log("socket getMessages", socket);
    // получаем сообщения из БД
    let url = "chats._V." + socket.chatId + "._V.messages";
    var filter = { "username._V": socket.tsName };
    var fields = { [url]: 1 };
    const messages = await db
      .get(db.users_database, db.users_collection, filter, fields)
      .then((results) => {
        // Проход по объекту юзера поиска нужного поля
        let results_found_field = results[0];
        let urls = url.split(".");
        // console.log('GET CUR results_found_field', results_found_field)
        // console.log('GET CUR urls', urls)
        for (i in urls) {
          if (results_found_field[urls[i]] != undefined)
            results_found_field = results_found_field[urls[i]];
        }
        return unwrap(results_found_field);
      });
    console.log("socket messages", messages);

    // передаем сообщения пользователям, находящимся в комнате
    // синонимы - распространение, вещание, публикация
    io.in(socket.chatId).emit("messages", messages);
  };

  // обрабатываем добавление сообщения
  // функция принимает объект сообщения
  const addMessage = (message) => {
    console.log("socket addMessage", message);

    console.log("send_message CUR req.body", req.body);

    let filter = { "username._V": req.body.user };
    let servertime = new Date().getTime(); // Текущее время сервера
    let actual_data_time =
      req.body.devicetime - // Время сервера
      servertime + // Время отправки записи
      req.body.time; // Время создания записи
    let update_fields = { [req.body.url]: req.body.value };
    let get_fields = { [req.body.url]: 1 };
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
              return {
                message: "Данные обновлены",
                time: actual_data_time,
              };
            } else {
              return {
                message: "Данные не обновлены",
                time: null,
              };
            }
          })
      })

    // выполняем запрос на получение сообщений
    getMessages();
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
