const express = require('express');
const router = express.Router();
const db = require('../db/db');


/* === Select from current logged user === */

// Get existed user
router.post('/get', (req, res, next)=>{
  /*
      req.body ex: {
        field1.subfield: 1      // Взять это поле
        field1.subfield: 0  // Исключить это поле
        // МОЖНО УКАЗЫВАТЬ ТОЛЬКО ОДИНАКОВЫЕ ЗНАКИ (все 1 или все 0)
      }
  */

//  if (!!req.session.user){
    console.log('GET req.session', req.session)
    console.log('GET req.body', req.body)
    var filter = {'email.value': req.session.user.email};
    var fields = {}
    if(!!req.body.url)
      fields = { [req.body.url]: 1};
    console.log('GET fields', fields)

    db
      .get(db.users_database, db.users_collection, filter, fields)
      .then((results)=>{
        console.log('GET results', results)

        // Достаём по url нужное вложенное поле из результата
        let urls = req.body.url.split('.')
        let send_answer = results[0]

        if(req.body.url.length > 0){
            for (i in urls){
                console.log(urls[i], send_answer)
                send_answer = send_answer[urls[i]]
            }
        }
        console.log('GET ans', send_answer)

        if (!!send_answer){
          res.send(send_answer);
        } else {
          res.send({value:null});
          //const err = new Error('Данные не найдены!');
          //err.status = 400;
          //  next(err);
        }
      })
      .catch((err)=>{
        next(err);
      })
//  }
//  else {
//    const err = new Error('Ошибка авторизации!');
//    err.status = 401;
//    next(err);
//  }
})

// Update field by existed user
router.post('/update', (req, res, next)=>{
  /*
      req.body ex: {
        field1.subfield: value      // Обновить или создать это поле
      }
  */
  console.log('UPDATE req.body', req.body)
  var filter = {'email.value':req.session.user.email};
  var fields = {}

  // Преобразовываем входные данные в данные для NoSQL запроса
  if(!!req.body.url)
    fields = {
        [req.body.url]: {
            'value':req.body.value,
            'uptime':req.body.uptime
        }
    };
  console.log('UPDATE fields', fields)

  db
    .update(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      if (!!results){
        if(!!req.body.email)
            req.session.user.email = req.body.email.value
        res.send({message: "Данные обновлены"});
      } else {
        const err = new Error('Данные не найдены!');
        err.status = 400;
          next(err);
      }
    })
    .catch((err)=>{
      next(err);
    })
})

// Update field by existed user
router.post('/remove', (req, res, next)=>{
  /*
      req.body ex: {
        field1.subfield: 1      // Удалить это поле
      }
  */
  console.log('REMOVE req.body', req.body)
  var filter = {'email.value':req.session.user.email};
  var fields = {}
  if(!!req.body.url)
    fields = { [req.body.url]: 1};
  console.log('REMOVE fields', fields)
  db
    .remove(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      if (!!results){
        console.log('REMOVE results', results)
        res.send({message: "Данные удалены"});
      } else {
        const err = new Error('Данные не найдены!');
        err.status = 400;
          next(err);
      }
    })
    .catch((err)=>{
      next(err);
    })
})


module.exports = router;