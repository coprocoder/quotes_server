const express = require('express');
const router = express.Router();
const db = require('../db/db');

const jwt = require('jwt-simple');
const config = require('../config/config');

const { val_key, time_key} = require('../public/javascripts/wrapper')

/* === Select from current logged user === */

// Get existed user
router.post('/get', (req, res, next)=>{
  /*
    req.body ex: {
      "url":"field1.subfield",
      "time":"time"
    }
    IF client time == server time return {value:null, time:null}
    ELSE if < then return {value:db_value, time: db_time}
  */

  //console.log('GET req.session', req.session)
  console.log('GET CUR req.head.auth', req.headers.auth)
  console.log('GET CUR req.body', req.body)

  //var filter = {'email.value': req.session.user.email};
  var token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')
  console.log('GET CUR token_data', token_data)
  var filter = {'_id': token_data.id};
  var fields = {}

  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      console.log('GET CUR results', results)

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0]
      let urls
      
      // Проход по объекту юзера поиска нужного поля
      if(!!req.body.url) {
        fields = { [req.body.url]: 1};
        if(req.body.url.length > 0){
          urls  = req.body.url.split('.')
          console.log('GET CUR results_found_field', results_found_field)
          console.log('GET CUR urls', urls)
          for (i in urls){
              results_found_field = results_found_field[urls[i]]
          }
        }
      }
      console.log('GET CUR ans', results_found_field)

      // Если поле найдено и данные являются актуальными, то возвращаем
      if (!!results_found_field){
        if(req.body.time < results_found_field.time || req.body.time == null) {
          for(key in results_found_field)
            console.log('field founded: ' + key)
            res.send(results_found_field);
        }
        else {
            res.send({
                [val_key]:null,
                [time_key]:null
            })
        }
      } else {
        res.send({[val_key]:null});
      }
    })
    .catch((err)=>{
      next(err);
    })
})

// Update field by existed user
router.post('/update', (req, res, next)=>{
  /*
    req.body ex: {
      "url":"field1.subfield",
      "value":"value",
      "time":"time",      = время создания записи
      "devicetime":"time" = время отправки записи
    }
    IF time > db_time RETURN {code:0, time: time + (server_time - devicetime)
    ELSE if < RETURN {code:1, time: null}
  */
 
  console.log('UPDATE CUR req.body', req.body)

  var token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')

  var filter = {'email':token_data.email};
  var servertime = new Date().getTime(); // Текущее время сервера
  
  var actual_data_time = null,
      update_fields = null
      get_fields = null

  // Преобразовываем входные данные в данные для NoSQL запроса
  if(!!req.body.url) {
    actual_data_time = req.body.devicetime  // Время сервера
                       - servertime         // Время отправки записи
                       + req.body.time      // Время создания записи

    update_fields = { [req.body.url.replace('.', '.'+val_key+'.')]: req.body.value };
    get_fields = { [req.body.url]: 1};
  }
  else{
     res.send({code: -1, time: null, message: "Фильтр данных не задан"});
  }
  console.log('UPDATE CUR update_fields', update_fields)

  db
    .get(db.users_database, db.users_collection, filter, get_fields)
    .then((get_results)=>{
      console.log('UPDATE CUR get_results', get_results)
      
      // Достаём нужное поле по URL
      let urls = req.body.url.split('.')
      let get_result_field = get_results[0]
      if(get_results.length > 0)
          for (i in urls) {
            if(get_result_field != undefined) {
              get_result_field = get_result_field[urls[i]]
            }
          }
      console.log('UPDATE CUR get_result_field', get_result_field)
    
      // Если поле найдено, то обновляем его
      if(!!get_result_field) { // length > 1 т.к. при GET несуществующего объекта возвращается метаобъект с полем ID
        // Если данные на сервере не актуальны, то обновляем их
        if(get_result_field.time < req.body.devicetime){
          db
            .update(db.users_database, db.users_collection, filter, update_fields)
            .then((results)=>{
              if (!!results){
                // Для динамической переавторизации при изменении email
                if(!!req.body.email)
                    req.session.user.email = req.body.email.value
                res.send({
                  message: "Данные обновлены",
                  code: 0,
                  time: get_result_field.time
                });
              } else {
                const err = new Error('Данные не обновлены!');
                err.status = 400;
                next(err);
              }
            })
            .catch((err)=>{ next(err); })
        }
        else {
          res.send({
            message: "Данные не являются актуальными",
            code: 1,
            time: null
          });
        }
      }
      // Если такого объекта или поля в базе нет, то создаём его
      else {
        db
          .update(db.users_database, db.users_collection, filter, update_fields)
          .then((results)=>{
            if (!!results){
              // Для динамической переавторизации при изменении email
              if(!!req.body.email)
                  req.session.user.email = req.body.email.value
              res.send({
                message: "Данные обновлены",
                code: 0,
                time: actual_data_time
              });
            } else {
              const err = new Error('Данные не обновлены!');
              err.status = 400;
              next(err);
            }
          })
          .catch((err)=>{
            next(err);
          })
       }
    })
    .catch((err)=>{
      next(err);
    })
})

module.exports = router;