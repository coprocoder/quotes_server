const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const db = require('../db/db');


/* ### === Pages block === */

router.get('/projects', (req, res, next)=>{
  console.log('projects')
  //res.send({'data':"projects"});

  var filter = {};
  var fields = {};
  
  // Стучимся в публичную БД
  db
    .get(db.public_database, "projects", filter, fields)
    .then((result)=>{
      console.log('projects result', result)
      if(result.length > 0) {
        res.send({'data':result})
      }
      else {
        res.send({'message':'Проекты отсутствуют'});
      }
    })
    .catch((err)=>{
      next(err);
    })
});

router.post('/projects', (req, res, next)=>{
  /* Create project */

  var servertime = new Date().getTime();

  console.log('new_project req.body', req.body)

  // Собираем данные для регистрации
  let data = {
    title: {
        'value': req.body.title,
        'time': servertime
    },
    note: {
      'value': req.body.note,
      'time': servertime
    },
    text: {
      'value': req.body.text,
      'time': servertime
    }
  };

  // Записываем данные в обычную БД
  db
    .create(db.public_database,"projects", data)
    .then((results)=>{
      console.log('projects created', results.ops[0])
    })
    .catch((err)=>{
      next(err);
    })
})

router.put('/projects', (req, res, next)=>{
  console.log('projects')

  var filter = {'_id': ObjectId(req.body.id) };
  
  var update_fields = null
  var get_fields = null

  // Преобразовываем входные данные в данные для NoSQL запроса
  if(!!req.body.url) {
    update_fields = {
      [req.body.url]: req.body.value
    };
    get_fields = { [req.body.url]: 1};
  }
  else{
     res.send({
          message: "Фильтр данных не задан",
          code: -1,
          time: null
        });
  }

  console.log('UPDATE PROJECTS update_fields', update_fields)
  
  // Стучимся в публичную БД
  db
  .get(db.public_database, "projects", filter, get_fields)
  .then((get_results)=>{
    console.log('UPDATE PROJECTS get_results', get_results)
    
    // Достаём нужное поле по URL
    let urls = req.body.url.split('.')
    let get_result_field = get_results[0]
    if(get_results.length > 0)
        for (i in urls) 
           get_result_field = get_result_field[urls[i]]
    console.log('UPDATE PROJECTS get_result_field', get_result_field)

    // Если поле найдено, то обновляем его
    if(!!get_result_field) { // length > 1 т.к. при GET несуществующего объекта возвращается метаобъект с полем ID
      // Если данные на сервере не актуальны, то обновляем их
      db
        .update(db.public_database, "projects", filter, update_fields)
        .then((results)=>{
          console.log('UPDATE PROJECTS result')
          if (!!results){
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
        .catch((err)=>{
          next(err);
        })
    }
  })
});

router.delete('/projects', (req, res, next)=>{
  console.log('projects')

  var filter = {'_id': ObjectId(req.body.id) };
  var get_fields = null

  // Преобразовываем входные данные в данные для NoSQL запроса
  if(!!req.body.url) {
    get_fields = { [req.body.url]: 1};
  }
  else{
     res.send({
          message: "Фильтр данных не задан",
          code: -1,
          time: null
        });
  }
  
  // Стучимся в публичную БД
  db
  .get(db.public_database, "projects", filter, get_fields)
  .then((get_results)=>{
    console.log('DELETE PROJECT get_results', get_results)
    
    // Если объект найден, то удаляем его
    if(!!get_results) {
      db
        .delete(db.public_database, "projects", filter, get_results)
        .then((results)=>{
          console.log('DELETE PROJECT result')
          if (!!results){
            res.send({
              message: "Данные удалены",
              code: 0
            });
          } else {
            const err = new Error('Данные не удалены!');
            err.status = 400;
            next(err);
          }
        })
        .catch((err)=>{
          next(err);
        })
    }
  })
});




router.get('/mobile_imgs', (req, res, next)=>{
  console.log('mobile_imgs')
  var filter = {};
  var fields = {};
  
  // Стучимся в публичную БД
  db
    .get(db.public_database, "mobile_app_imgs", filter, fields)
    .then((result)=>{
      if(result.length > 0) {
        res.send({'data':result})
      }
      else {
        res.send({'message':'Изображения отсутствуют'});
      }
    })
    .catch((err)=>{
      next(err);
    })
});

module.exports = router;