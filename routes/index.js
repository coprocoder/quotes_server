const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt-nodejs');

const jwt = require('jwt-simple');
const config = require('../config/config');
let passport = require('passport');

let auth = passport.authenticate('jwt', {
  session: false
});


const users_database = 'usersdb';
const users_collection = 'users';


/* ### === Pages block === */

router.get('/', (req, res)=>{
//  res.json({ message: 'Добро пожаловать!' })
  console.log('req.session', req.session)
  res.render('index', { user: req.session.user });
});

/* Simple example auth secured route */
router.get('/secret', auth, (req, res)=>{
  res.json({
    message: 'Секретная страница!'
  })
});



/* ### === Secondary functions block  === */

// Compare (password from request) and (password hash from db)
const isValidPassword = function(user, password) {
  return bcrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
const createHash = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}



/* ### === Authorization block === */

router.post('/login', (req, res, next)=>{
  /* Login = Autorization
    Fields:
        -username
        -password
  */
  console.log('login req.body', req.body)
  var filter = {"username": req.body.username};
  var fields = {};
  db
    .get(users_database, users_collection, filter, fields)
    .then((results)=>{
      console.log('login results', results)
      if (isValidPassword(results[0], req.body.password)) {
        let payload ={
          id: results[0]._id
        }
        let token = jwt.encode(payload, config.secret);
        req.session.user = {id: results[0]._id, name: results[0].username}
		req.session.save()  // Сохранение сессии в БД mongoStore
        res.json({status: 200, token: token});

      } else {
        const err = new Error('Не верный логин или пароль!');
        err.status = 400;
        next(err);
      }
    })
    .catch((err)=>{
      next(err);
    })
})

router.post('/logout', (req, res, next)=>{
    req.logout();
    if (req.session.user)
		delete req.session.user;
    res.json({status: 200, msg:'logout succesfull'});
});

router.post('/signup', (req, res, next)=>{
  /* SignUp = Registration
    Fields:
      -username
      -password
      -repeatPassword
      -email
  */
  console.log('signup req.body', req.body)
  if(req.body.password === req.body.repeatPassword){
    var filter = {"username": req.body.username};
    var fields = {};
    db
      .get(users_database, users_collection, filter, fields)
      .then((results)=>{
        if (results.length == 0){
          data = {
            username: req.body.username,
            password: createHash(req.body.password),
            email: req.body.email,
          };
          db
            .add('users', data)
            .then((results)=>{
              console.log('results', results)
              res.json({
                message: 'Пользователь добавлен',
                user_id: results._id,
              })
            })
            .catch((err)=>{
              next(err);
            })
        } else {
          const err = new Error('Такой пользователь уже есть!');
          err.status = 400;
            next(err);
        }
      })
      .catch((err)=>{
        next(err);
      })
  } else {
    const err = new Error('Не совпадает пароль и подтверждение пароля!');
    err.status = 400;
      next(err);
  }
})


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
    .get(users_database, users_collection, filter, fields)
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
    .getById(users_database, users_collection, id)
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
    .update(users_database, users_collection, filter, data)
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
    .remove(users_database, users_collection, filter, data)
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




/* === Select from ALL === */

// Get existed user
router.post('/get_all', (req, res, next)=>{
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
  var data = req.body.data;
  db
    .get(users_database, users_collection, filter, data)
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
router.post('/create_user', (req, res, next)=>{
  console.log('CREATE req.body', req.body)
  var db = 'usersdb';
  var collection = 'users';
  var data = req.body;
      db
    .create(db, collection, data)
    .then((results)=>{
      //console.log('CREATE results', results)
      if (!!results){
        res.send({status: 200, message: "Пользователь создан", user:results.ops[0]});
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
router.post('/delete_user', (req, res, next)=>{
  console.log('DELETE req.body', req.body)
  var db = 'usersdb';
  var collection = 'users';
  var data = req.body;
  db
    .delete(db, collection, data)
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