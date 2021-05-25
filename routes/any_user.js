const express = require('express');
const router = express.Router();
const db = require('../db/db');

/* === Select from ALL === */

// Get existed user
router.post('/get', (req, res, next)=>{
  /*
  ex:req.body {
      "filter":{ // Фильтрация коллекции
        "age":25 // Все объекты, у которых age = 25
      },
      "fields":{   // Какие поля достать
        "height":0 // Все поля кроме height
         ИЛИ
        "height":1 // Только height
      }
    }
  */
  console.log('GET req.body', req.body)
  var filter = req.body.filter;
  var fields = req.body.fields;
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      console.log('GET results', results)
      if (!!results){
        res.send(results);
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

/* === NEW ITEMS BLOCK === */

// Create new user
router.post('/create', (req, res, next)=>{
  console.log('CREATE req.body', req.body)
  var data = req.body;
  db
    .create(db.users_database, db.users_collection, data)
    .then((results)=>{
      //console.log('CREATE results', results)
      if (!!results){
        res.send({message: "Пользователь создан", user:results.ops[0]});
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

// Delete existed user
router.post('/delete', (req, res, next)=>{
  console.log('DELETE req.body', req.body)
  var data = req.body;
  db
    .delete(db.users_database, db.users_collection, data)
    .then((results)=>{
      console.log('DELETE results', results)
      if (!!results){
        res.send(results);
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