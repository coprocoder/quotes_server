const express = require('express');
const router = express.Router();
const messaging = require('./firebase_conf');

const db = require('../../db/db');
const jwt = require('jwt-simple');
const config = require('../../config/config');

router.post('/send', async (req, res) => {
  console.log('firebase send body', req.body)

  // var user_token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')
  // console.log('firebase send user_token', user_token_data)

  const registrationTokens = ['cMRhMCitY5eUqeMMu1Lk-u:APA91bFg6mI6i50QZ4Typyz3k1Va45g4Ma5E1AHCyen-EAzz4Q2nDGazfW5DT2aPZSltjgbx4WL6wXauInsQGwLxb_JQAzmrnH4vbnz9-f2SV-f3iauMt7JN_bsW_eBuGbMecDBUATKn'];
  const imageUri = 'https://e7.pngegg.com/pngimages/826/677/png-clipart-butterfly-red-butterfly-brush-footed-butterfly-photography.png'
  const message = {
    token: registrationTokens[0],

    // notification: {
    //   body: 'This is an FCM notification that displays an image!',
    //   title: 'FCM Notification',
    // },
    // data: {
    //   score: '850',
    //   time: '2:45'
    // },
    "data": {
      "title": "FCM Message",
      "body": "This is an FCM Message",
      "icon": "https://shortcut-test2.s3.amazonaws.com/uploads/role_image/attachment/10461/thumb_image.jpg",
      "link": "https://yourapp.com/somewhere"
    },
    apns: {
      payload: {
        aps: {
          'mutable-content': 1,
        },
      },
      fcm_options: {
        image: imageUri,
      },
    },
    android: {
      notification: {
        image: imageUri,
        icon: 'stock_ticker_update',
        color: "#FF1111",
        defaultSound: true,
        priority: 'max',
      },
    },
  };
  registrationTokens.forEach(i => {
    messaging.send({ ...message, token: i })
  })
  // console.log('firebase send message', message)
  // messaging.send(message)

  return res.send({}).status(200)
})

router.post('/register_token', (req, res, next) => {
  /*
    req,head.auth: jwt_token
    req.body ex: {
      token: <firebase token>
      device: <device name>
    }
  */

  console.log('register_token req.body', req.body)
  console.log('register_token req.headers.auth', req.headers.auth)

  var token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')
  console.log('register_token token_data', token_data)

  var filter = { 'email': token_data.email };

  // Преобразовываем входные данные в данные для NoSQL запроса
  let get_secure_fields = { ['fb_token']: 1 };
  let get_user_fields = { [token_data.email._V]: 1 };

  console.log('register_token get_user_fields', get_user_fields)
  console.log('register_token get_secure_fields', get_secure_fields)

  // Ищем юзера с email из jwt_token
  db
    .get(db.users_database, db.users_collection, filter, get_user_fields)
    .then((get_users_results) => {
      console.log('register_token get_users_results', get_users_results)

      var filter_secure = { 'user_id': get_users_results[0]._id };

      // По нему ищем его объект в secure
      db
        .get(db.secure_database, db.secure_collection, filter_secure, get_secure_fields)
        .then((get_secure_results) => {
          console.log('register_token get_secure_results', get_secure_results)

          // // Достаём нужное поле по URL
          let get_result_field = get_secure_results[0]
          let update_secure_fields = { 'fb_token': 
            Object.assign({}, 
              get_result_field.fb_token, 
              { [req.body.device]: req.body.token }
            ) 
          };
          console.log('register_token update_secure_fields', update_secure_fields)

          // Если поле найдено, то обновляем его
          if (!!get_result_field) { // length > 1 т.к. при GET несуществующего объекта возвращается метаобъект с полем ID
            db
              .update(db.secure_database, db.secure_collection, filter_secure, update_secure_fields)
              .then((results) => {
                if (!!results) {
                  res.send({
                    message: "Данные обновлены",
                  });
                } else {
                  const err = new Error('Данные не обновлены!');
                  err.status = 400;
                  next(err);
                }
              })
              .catch((err) => { next(err); })
          }
          // Если такого объекта или поля в базе нет, то создаём его
          else {
            db
              .update(db.secure_database, db.secure_collection, filter_secure, update_fields)
              .then((results) => {
                if (!!results) {
                  res.send({
                    message: "Данные обновлены",
                  });
                } else {
                  const err = new Error('Данные не обновлены!');
                  err.status = 400;
                  next(err);
                }
              })
              .catch((err) => {
                next(err);
              })
          }
        })
        .catch((err) => {
          next(err);
        })
    })
})

router.post('/delete_token', (req, res, next) => {
  /*
    req,head.auth: jwt_token
    req.body ex: {
      device: <device name>
    }
  */

  console.log('delete_token req.body', req.body)
  console.log('delete_token req.headers.auth', req.headers.auth)

  var token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')
  console.log('delete_token token_data', token_data)

  var filter = { 'email': token_data.email };

  // Преобразовываем входные данные в данные для NoSQL запроса
  let get_secure_fields = { ['fb_token']: 1 };
  let get_user_fields = { [token_data.email._V]: 1 };

  console.log('delete_token get_user_fields', get_user_fields)
  console.log('delete_token get_secure_fields', get_secure_fields)

  db
    .get(db.users_database, db.users_collection, filter, get_user_fields)
    .then((get_users_results) => {
      console.log('delete_token get_users_results', get_users_results)

      var filter_secure = { 'user_id': get_users_results[0]._id };
      var remove_secure_fields = { ['fb_token.'+req.body.device] : 1}
      console.log('delete_token filter_secure', filter_secure)
      console.log('delete_token remove_secure_fields', remove_secure_fields)

      db
        .remove(db.secure_database, db.secure_collection, filter_secure, remove_secure_fields)
        .then((remove_secure_results) => {
          res.send({
            message: "Данные обновлены",
          });
        })
    })
})


module.exports = router;