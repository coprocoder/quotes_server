var createError = require('http-errors');
const cors = require('cors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');        // Для просмотра request.body в POST
var logger = require('morgan');
var cons = require('consolidate');

//### Mongo sessions
var mongoose = require("mongoose")
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);

var app = express();
app.use(cors());
app.options('*', cors());

//### view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//app.use(favicon());
app.use(logger('dev'));

//### req.body parse
app.use(express.urlencoded({ extended: false })); // этим мы делаем доступным объект req.body (ну а в нем поля формы)
app.use(express.json()); // Для просмотра request.body в POST

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//### Logging of visits
app.use(function(req, res, next){
    let now = new Date();

    let date = now.toISOString().slice(0,10);
    let year = date.slice(0,4)
    let month = date.slice(6,7)
    let day = date.slice(9,10)

    let hour = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    let data = `${day}.${month}.${year} ${hour}:${minutes}:${seconds} ${req.method} ${req.url} ${req.get("user-agent")}`;

    fs.appendFile("server.log", data + "\n", function(){});
    next();
});

//### Sessions
var sess = {
    secret: 'super_secret_word', // секретное слово для шифрования
    credentials: 'include',
    resave: true,
    saveUninitialized: false,
    cookie: {
        path: '/',          // где действует
        httpOnly: true,     // чтобы куку не могли читать на клиенте

        // время жизни куки в милисекундах(null = infinity, 3600000 = 1 Hour)
//        expires: new Date(Date.now() + 30000), // не работает, дата устанавливается на момент запуска сервера, время жизни отрицательное
//        expires: false // infinity live time   // сессии не убиваются
        expires : 30000,
    },
    store: new MongoStore({
        url: 'mongodb://localhost:27017/usersdb'
    }),
    rolling: true,
}
if (app.get('env') === 'production') {
  console.log('== production server ==')
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess))

//### Запись и хранение данных в куки
app.all('/', function (req, res, next) {
    // в независимости от логина или нет получаем id
    console.log(req.sessionID);

    // в сессию мы можем проставлять кастомные переменные
    req.session.views = req.session.views === void 0 ? 0 : req.session.views;
    req.session.views++;
    next();
})

//### Check auth (on all route except route /auth) = /\/((?!route1|route2).)*/
app.use(/\/((?!auth).)*/, function(req, res, next){
  console.log('middleware req.session', req.session)
  req.session.reload(function(err) {
    if (req.session.isLogged){
      next();
    }
    else {
      const err = new Error('Ошибка авторизации!');
      err.status = 401;
      next(err);
    }
  })
});

//### Routers Files
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var curUserRouter = require('./routes/current_user');
var anyUserRouter = require('./routes/any_user');

//### Routes
app.use('/', indexRouter);              // Корень, базовые страницы
app.use('/auth/', authRouter);          // Авторизация/регистрация
app.use('/account/', curUserRouter);    // Текущий пользователь
app.use('/users/', anyUserRouter);      // Все пользователи


/* ### === Error handlers block === */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    console.log('=== ERROR', err)
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', { code: err.status, message: err.message });
});

module.exports = app;
