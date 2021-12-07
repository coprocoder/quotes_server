#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require("./app");
const debug = require("debug")("node-test:server");
const http = require("http");
const config = require("./config/config.json");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3001");

// Задаём параметры подключения к БД
const MongoClient = require("mongodb").MongoClient;
const url_db = process.env.MONGODB_URI || config.db;
const mongoClient = new MongoClient(url_db, { useUnifiedTopology: true });

mongoClient.connect(function (err, client) {
  if (err) return console.log(err);

  // Открываем соединение с БД
  dbClient = client;

  app.set("port", port);
  const server = http.createServer(app);

  server.listen(port, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
  });

  server.on("error", function (error) {
    if (error.syscall !== "listen") {
      throw error;
    }

    var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.on("listening", function () {
    var addr = server.address();
    var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
  });

  // подключаем к серверу Socket.IO
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });

  // получаем обработчики событий
  const registerMessageHandlers = require("./socket_handlers/messageHandlers.js");

  // данная функция выполняется при подключении каждого сокета (обычно, один клиент = один сокет)
  const onConnection = (socket) => {
    // выводим сообщение о подключении пользователя
    console.log("User connected");

    // получаем название комнаты из строки запроса "рукопожатия"
    const { chatId, tsName } = socket.handshake.query;
    // сохраняем название комнаты в соответствующем свойстве сокета
    socket.chatId = chatId;
    socket.tsName = tsName; // topic starter username

    // присоединяемся к комнате (входим в нее)
    socket.join(chatId);

    // регистрируем обработчики
    // обратите внимание на передаваемые аргументы
    registerMessageHandlers(io, socket);

    // обрабатываем отключение сокета-пользователя
    socket.on("disconnect", () => {
      // выводим сообщение
      console.log("User disconnected");
      // покидаем комнату
      socket.leave(chatId);
    });
  };

  io.on("connection", onConnection);
});

process.on("SIGINT", () => {
  dbClient.close(); // Закрываем соединение с БД
  console.log("=== SERVER STOPPED BY USER ===");
  process.exit(); // Останавливаем сервер
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
