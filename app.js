const createError = require("http-errors");
const cors = require("cors");
const express = require("express");
const path = require("path");
const cons = require("consolidate");

//### Routers Files
const baseRouter = require("./routes/base");

var app = express();
app.use(cors());
app.options("*", cors());

//### view engine setup
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

//### req.body parse
app.use(express.urlencoded({limit: "10mb", extended: true})); // этим мы делаем доступным объект req.body (ну а в нем поля формы)
app.use(express.json({limit: "10mb", extended: true})); // Для просмотра request.body в POST

app.use(express.static(path.join(__dirname, "public")));

//### Routes
app.use("/api", baseRouter); // Авторизация/регистрация

/* ### === Error handlers block === */

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (err.code != "ERR_HTTP_HEADERS_SENT") console.log("=== ERROR", err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).send({code: err.status, message: err.message});
});

module.exports = app;
