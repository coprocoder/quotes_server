const express = require('express');
const router = express.Router();
const db = require('../db/db');
const conversion = require('../db/data_conversion');

const jwt = require('jwt-simple');
const config = require('../config/config');

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
  
  // Стучимся в публичную БД
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((user_results)=>{
      if(user_results.length > 0) {
        var filter = {"user_id.value": user_results[0]._id};

        // Стучимся в приватную БД
        db
          .get(db.secure_database, db.secure_collection, filter, fields)
          .then((secure_results)=>{
            if (conversion.isValidPassword(req.body.password, secure_results[0].password.value)) {

              // Данные внутри токена
              let payload ={
                id: user_results[0]._id,
                username: user_results[0].username.value,
                email:user_results[0].email.value,
                role: secure_results[0].role.value
              }
              let token = jwt.encode(payload, config.secret);
              
              req.session.user = {id: user_results[0]._id, email: user_results[0].email.value}
              req.session.isLogged = true;
              req.session.save()  // Сохранение сессии в БД mongoStore
              console.log('login req.session', req.session)
              
              res.json({
                token: token, 
                //user: payload
              });
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
    console.log('logout req.session BEFORE', req.session)
    req.session.isLogged = false;
    if (req.session.user)
		delete req.session.user;
    res.json({msg:'logout succesfull'});
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
        let data = {
          email: {
              'value': req.body.email,
              'time': servertime
          },
          username: {
            'value': req.body.username,
            'time': servertime
          }
        };
        // Записываем данные в обычную БД
        db
          .create(db.users_database,db.users_collection, data)
          .then((results)=>{
            var new_user = results.ops[0]
            
            let payload ={
              id: new_user._id,
              email:new_user.email.value,
              role: 0
            }
            let token = jwt.encode(payload, config.secret);
            req.session.user = {id: new_user._id, email: new_user.email.value}
            req.session.save()  // Сохранение сессии в БД mongoStore
            console.log('sess', req.session)

            // Собираем секретные данные для регистрации (пароль)
            let secure_data = {
              user_id: {
                  'value': new_user._id,
                  'time': servertime
              },
              password: {
                  'value': conversion.createHash(req.body.password),
                  'time': servertime
              },
              role: {
                  'value': 1,
                  'time': servertime
              }
            };
            // Записываем пароль в секретную БД
            db
              .create(db.secure_database,db.secure_collection, secure_data)
              .then((results)=>{
                res.json({
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