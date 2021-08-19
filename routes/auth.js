const express = require('express');
const router = express.Router();
const db = require('../db/db');
const conversion = require('../db/data_conversion');

const jwt = require('jwt-simple');
const config = require('../config/config');

// Конфигурация виджет-пресетов пользователя
const widget_config = require('../db/templates/config_widget');
const variables_config = require('../db/templates/config_variables');

const { val_key, time_key, wrap, unwrap } = require('../public/javascripts/wrapper')

/* ### === Authorization block === */

router.post('/login', (req, res, next)=>{
  /* Login = Autorization
    Fields:
        -email
        -password
  */
  console.log('login req.body', req.body)
  var filter = {["email."+val_key]: req.body.email};
  var fields = {};
  
  // Стучимся в публичную БД
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((user_results)=>{
      console.log('user_results[0]', user_results[0])
      if(user_results.length > 0) {
        var filter = {["user_id"]: user_results[0]._id};

        // Стучимся в приватную БД
        db
          .get(db.secure_database, db.secure_collection, filter, fields)
          .then((secure_results)=>{
            console.log('secure_results[0]', secure_results[0])
            if (conversion.isValidPassword(req.body.password, secure_results[0].password)) {

              let user = user_results[0]
              let unwrapped_user = user_results[0] 

              // Данные внутри токена
              let payload ={
                id: user._id,
                username: unwrapped_user.username,
                email:unwrapped_user.email,
                role: unwrapped_user.role
              }
              let token = jwt.encode(payload, config.secret);
              
              req.session.user = {id: user._id, email: unwrapped_user.email}
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
  var filter = {["email."+val_key]: req.body.email};
  var fields = {};
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      if (results.length == 0){
        // Собираем данные для регистрации
        let data = {
          email: req.body.email,
          username: req.body.username,
          diary: {},
          history: {},
          variables: {}
        };

        // Генерация шаблонных полей истории
        data['email'] = wrap(req.body.email, servertime)
        data['username'] = wrap(req.body.username, servertime)
        data['diary'] = wrap(widget_config, servertime)
        data['history'] = wrap(Object.assign({}, ...Object.keys(widget_config).map(x => ({[x]: {} }))), servertime)
        data['variables'] = wrap(Object.assign({}, ...Object.keys(widget_config).map(x => ({[x]: {locale: variables_config[x] }}))), servertime)

        // Записываем данные в обычную БД
        db
          .create(db.users_database,db.users_collection, data)
          .then((results)=>{
            var new_user = results.ops[0]
            console.log('new_user', new_user)
            
            let payload ={
              id: new_user._id,
              email: new_user.email,
              role: 0
            }
            let token = jwt.encode(payload, config.secret);
            req.session.user = {id: new_user._id, email: new_user.email}
            req.session.save()  // Сохранение сессии в БД mongoStore
            console.log('sess', req.session)

            // Собираем секретные данные для регистрации (пароль)
            let secure_data = {
              user_id: new_user._id,
              password: conversion.createHash(req.body.password),
              role: 1,
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