const express = require('express');
const router = express.Router();
const db = require('../db/db');

const jwt = require('jwt-simple');
const config = require('../config/config');

router.post('/find_med', (req, res, next)=>{
  /*
    req.body ex: {
      "field_name":<value>,
    }
  */

  console.log('find_med GET CUR req.body', req.body)

  //var filter = {'email.value': req.session.user.email};
  var filter = {[Object.keys(req.body)[0]]: {$regex: Object.values(req.body)[0]}};
  var fields = {}

  db
    .get(db.catalog_database, db.catalog_collection_med, filter, fields)
    .then((results)=>{
      console.log('find_med GET CUR results', results)
      if(results.length)
        res.send(results);
      else
        res.send({});

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0]
      let urls
    })
    .catch((err)=>{
      next(err);
    })
})

router.post('/find_diary', (req, res, next)=>{
  /*
    req.body ex: {
      "field_name":<value>,
    }
  */

  console.log('find_diary GET CUR req.body', req.body)

  //var filter = {'email.value': req.session.user.email};
  var filter = {
    [Object.keys(req.body)[0]]: typeof(Object.values(req.body)[0]) == "string" ? 
                                  {$regex: Object.values(req.body)[0]} : 
                                  Object.values(req.body)[0]};
  var fields = {}

  db
    .get(db.catalog_database, db.catalog_collection_diary, filter, fields)
    .then((results)=>{
      console.log('find_diary GET CUR results', results)
      if(results.length)
        res.send(results);
      else
        res.send({});

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0]
      let urls
    })
    .catch((err)=>{
      next(err);
    })
})

router.post('/find_var', (req, res, next)=>{
  /*
    req.body ex: {
      "field_name":<value>,
    }
  */

  console.log('find_var GET CUR req.body', req.body)

  //var filter = {'email.value': req.session.user.email};
  var filter = {
    [Object.keys(req.body)[0]]: typeof(Object.values(req.body)[0]) == "string" ? 
                                  {$regex: Object.values(req.body)[0]} : 
                                  Object.values(req.body)[0]};
  var fields = {}

  db
    .get(db.catalog_database, db.catalog_collection_variable, filter, fields)
    .then((results)=>{
      console.log('find_var GET CUR results', results)
      if(results.length)
        res.send(results);
      else
        res.send({});

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0]
      let urls
    })
    .catch((err)=>{
      next(err);
    })
})


module.exports = router;