const express = require('express');
const router = express.Router();
const db = require('../db/db');
const conversion = require('../db/data_conversion');

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


/* ### === Authorization block === */

router.post('/login', (req, res, next)=>{
  /* Login = Autorization
    Fields:
        -email
        -password
  */
  console.log('login req.body', req.body)
  var filter = {"email.value": req.body.email};
  var fields = {};
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      console.log('login results', results)
      if (conversion.isValidPassword(req.body.password, results[0].password.value)) {
        let payload ={
          id: results[0]._id
        }
        let token = jwt.encode(payload, config.secret);
        req.session.user = {id: results[0]._id, email: results[0].email.value}
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
      -password
      -email
  */
  console.log('signup req.body', req.body)
  var timestamp = new Date().getTime();
  var filter = {"email": req.body.email};
  var fields = {};
  db
    .get(db.users_database, db.users_collection, filter, fields)
    .then((results)=>{
      if (results.length == 0){
        data = {
          password: {
              'value': conversion.createHash(req.body.password),
              'uptime': timestamp
          },
          email: {
              'value': req.body.email,
              'uptime': timestamp
          }
        };
        db
          .create(db.users_database,db.users_collection, data)
          .then((results)=>{
            res.json({
              message: 'Пользователь добавлен',
              user_id: results.ops[0]._id,
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
})


module.exports = router;