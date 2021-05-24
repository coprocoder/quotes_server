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
  console.log('GET req.body', req.body)
  var filter = {'username':req.session.user.name};
  var fields = req.body;
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      console.log('GET results', results)
      if (!!results){
        res.send(results[0]);
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

// Get user by id
router.post('/get_by_id', (req, res, next)=>{
  /*
      req.body ex: {
        "id": "60a23286b9c5fe268c57b69e"
      }
  */
  console.log('GETbyID req.body', req.body)
  var id = req.body.id;
  db
    .getById(db.users_database, db.users_collection, id)
    .then((results)=>{
      console.log('GET results', results)
      if (!!results){
        res.send(results[0]);
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
router.post('/update', (req, res, next)=>{
  /*
      req.body ex: {
        field1.subfield: value      // Обновить или создать это поле
      }
  */
  console.log('UPDATE req.body', req.body)
  var filter = {'username':req.session.user.name};
  var data = req.body;
  db
    .update(db.users_database, db.users_collection, filter, data)
    .then((results)=>{
      //console.log('UPDATE results', results)
      if (!!results){
        res.send({status: 200, message: "Данные обновлены"});
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
  console.log('UPDATE req.body', req.body)
  var filter = {'username':req.session.user.name};
  var data = req.body;
  db
    .remove(db.users_database, db.users_collection, filter, data)
    .then((results)=>{
      //console.log('UPDATE results', results)
      if (!!results){
        res.send({status: 200, message: "Данные удалены"});
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