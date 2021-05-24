const express = require('express');
const router = express.Router();
const db = require('../db/db');
const bcrypt = require('bcrypt-nodejs');

const jwt = require('jwt-simple');
const config = require('../config/config');
let passport = require('passport');

auth = passport.authenticate('jwt', {
  session: false
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
    .get(db.users_database, db.users_collection, filter, fields)
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
      .get(db.users_database, db.users_collection, filter, fields)
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


module.exports = router;