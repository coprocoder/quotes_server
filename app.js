const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mimetypes = require("./config/mimetypes.js")
const config = require('./config/config.json')

//### Mongo sessions
// const mongoose = require("mongoose")
const session = require('express-session')
const MongoStore = require('connect-mongo')(session);


//### Routers Files
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const usersRouter = require('./routes/users');
const filesRouter = require('./routes/files');
const catalogRouter = require('./routes/catalog');
const messagingRouter = require('./routes/firebase/messaging');

var app = express();
app.use(cors());
app.options('*', cors());

app.use(logger('dev'));

//### req.body parse
app.use(express.urlencoded({ limit: '10mb', extended: true })); // этим мы делаем доступным объект req.body (ну а в нем поля формы)
app.use(express.json({limit: '10mb', extended: true})); // Для просмотра request.body в POST

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

    fs.appendFile("requests.log", data + "\n", function(){});
    next();
});

//### Sessions (saved in cache)
var sess = {
    secret: 'super_secret_word', // секретное слово для шифрования
    credentials: 'include',
    resave: true,
    saveUninitialized: false,
    cookie: {
        path: '/',          // где действует
        httpOnly: true,     // чтобы куку не могли читать на клиенте

        // время жизни куки в милисекундах(null = infinity, 3600000 = 1 Hour)
        // expires: false // infinity live time
        expires : 300000,
        // не работает, дата устанавливается на момент запуска сервера, время жизни отрицательное
        // expires: new Date(Date.now() + 30000),
         
    },
    store: new MongoStore({
        url: process.env.MONGODB_URI || (config.db + '/usersdb')
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
// app.all('/', function (req, res, next) {
//     // в независимости от логина или нет получаем id
//     console.log(req.sessionID);

//     // в сессию мы можем проставлять кастомные переменные
//     req.session.views = req.session.views === void 0 ? 0 : req.session.views;
//     req.session.views++;
//     next();
// })

//### Check auth (on all route except route /auth) = /\/((?!route1|route2).)*/
// app.use(/\/((?!auth).)*/, function(req, res, next){
//   console.log('middleware req.session', req.session)
//   req.session.reload(function(err) {
//     if (req.session.isLogged){
//       next();
//     }
//     else {
//       const err = new Error('Ошибка авторизации!');
//       err.status = 401;
//       next(err);
//     }
//   })
// });

//### Проверка URL по его окончанию. Если файл, то вернуть его, иначе перейти по маршруту
app.use('/', function(req,res, next) {
    var filePath = '.' + req.url;    
    var extname = path.extname(filePath);
    var contentType = mimetypes[extname]
    
    if(!!contentType) {
        filePath = path.join(__dirname, filePath)
        res.sendFile(filePath)
    }
    else
        next()
})

//### Routes
app.use('/api', indexRouter);             // Корень, базовые страницы
app.use('/api/auth', authRouter);          // Авторизация/регистрация
app.use('/api/profile', profileRouter);    // Текущий пользователь
app.use('/api/users', usersRouter);        // Все пользователи
app.use('/api/files', filesRouter);        // Up/Download files
app.use('/api/catalog', catalogRouter);    // Справочники
app.use('/api/messaging', messagingRouter);    // Справочники

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
