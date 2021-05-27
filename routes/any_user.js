const express = require('express');
const router = express.Router();
const db = require('../db/db');

/* === Select fields from ALL === */

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
  console.log('GET ANY req.body', req.body)
  var filter = req.body.filter;
  var fields = req.body.fields;
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      console.log('GET ANY results', results)
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



/* === FULL ITEMS BLOCK === */

// Create new user
router.post('/create', (req, res, next)=>{
  console.log('CREATE ANY req.body', req.body)
  res.redirect(307, "../../auth/signup") // 307 не меняет метод и тело при редиректе
})

// Delete existed user
router.post('/delete', (req, res, next)=>{
  console.log('DELETE ANY req.body', req.body)
  var filter = req.body;
  var fields = {};
  db
    // Ищем объект для удаления
    .get(db.users_database, db.users_collection, filter, fields)
    .then((get_results)=>{
      console.log('DELETE ANY USER results', get_results)
      db
        // Удаляем объекта из обычной БД
        .delete(db.users_database, db.users_collection, filter)
        .then((del_user_results)=>{
          // Ищем в секретной БД связанный с юзером объект и удаляем его
          var secure_filter = { 'user_id.value': get_results[0]._id}
          db
            .delete(db.secure_database, db.secure_collection, secure_filter)
            .then((del_secure_results)=>{
              if (!!del_secure_results){
                res.send(del_secure_results);
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
        .catch((err)=>{
          next(err);
        })
    })
    .catch((err)=>{
      next(err);
    })
})

/*
// Delete existed user
router.post('/delete', (req, res, next)=>{
  console.log('DELETE req.body', req.body)
  var data = req.body;
  db
    .delete(db.users_database, db.users_collection, data)
    .then((results)=>{
      //console.log('DELETE results', results)
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

*/

module.exports = router;