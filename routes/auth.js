const express = require('express');
const router = express.Router();
const db = require('../db/db');
const conversion = require('../db/data_conversion');

const jwt = require('jwt-simple');
const config = require('../config/config');
let passport = require('passport');

auth = passport.authenticate('jwt', {
  session: false
});

/* Simple example auth secured route */
router.get('/secret', auth, (req, res)=>{
  res.json({
    message: 'Секретная страница!'
  })
});


/* ### === Authorization block === */

router.post('/login', (req, res, next)=>{
  /* Login = Autorization
    Fields:
        -email
        -password
  */

  console.log('login req.body', req.body)
  var filter = {"email.value": req.body.email};
  var fields = {};
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((user_results)=>{
      //console.log('login results', user_results)
      if(user_results.length > 0) {
        var filter = {"user_id.value": user_results[0]._id};
        db
          .get(db.secure_database, db.secure_collection, filter, fields)
          .then((secure_results)=>{
            //console.log('login secure results', secure_results)
            if (conversion.isValidPassword(req.body.password, secure_results[0].password.value)) {
              let payload ={
                id: user_results[0]._id
              }
              let token = jwt.encode(payload, config.secret);
              req.session.user = {id: user_results[0]._id, email: user_results[0].email.value}
              req.session.save()  // Сохранение сессии в БД mongoStore
              console.log('login req.session', req.session)
              res.json({status: 200, token: token});
            }
            else {
              const err = new Error('Не верный логин или пароль!');
              err.status = 401;
              next(err);
            }
          })
          .catch((err)=>{
            next(err);
          })
      }
      else {
        const err = new Error('Не верный логин или пароль!');
        err.status = 401;
        next(err);
      }
    })
    .catch((err)=>{
      next(err);
    })
})

router.post('/logout', (req, res, next)=>{
    req.logout();
    if (req.session.user)
		delete req.session.user;
    res.json({status: 200, msg:'logout succesfull'});
});

router.post('/signup', (req, res, next)=>{
  /* SignUp = Registration
    Fields:
      -password
      -email
  */
  console.log('signup req.body', req.body)
  var servertime = new Date().getTime();
  var filter = {"email": req.body.email};
  var fields = {};
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      if (results.length == 0){
        // Собираем данные для регистрации
        data = {
          email: {
              'value': req.body.email,
              'time': servertime
          }
        };
        // Записываем данные в обычную БД
        db
          .create(db.users_database,db.users_collection, data)
          .then((results)=>{
            var new_user = results.ops[0]
            let payload ={
              id: new_user._id
            }
            let token = jwt.encode(payload, config.secret);
            req.session.user = {id: new_user._id, email: new_user.email.value}
            req.session.save()  // Сохранение сессии в БД mongoStore
            console.log('sess', req.session)

            // Собираем секретные данные для регистрации (пароль)
            secure_data = {
              user_id: {
                  'value': new_user._id,
                  'time': servertime
              },
              password: {
                  'value': conversion.createHash(req.body.password),
                  'time': servertime
              }
            };
            // Записываем пароль в секретную БД
            db
              .create(db.secure_database,db.secure_collection, secure_data)
              .then((results)=>{
                res.json({
                  status: 200,
                  message: 'Пользователь добавлен',
                  user_id: new_user._id,
                  token: token
                })
              })
              .catch((err)=>{
                next(err);
              })
          })
          .catch((err)=>{
            next(err);
          })
      } else {
        const err = new Error('Пользователь с такой почтой уже существует!');
        err.status = 400;
          next(err);
      }
    })
    .catch((err)=>{
      next(err);
    })
})


module.exports = router;