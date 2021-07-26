const express = require('express');
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

module.exports = router;