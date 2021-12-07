const express = require("express");
const router = express.Router();
const messaging = require("./firebase_conf");

const db = require("../../db/db");
const jwt = require("jwt-simple");
const config = require("../../config/config");
var fs = require("fs");

router.post("/test", async (req, res) => {
  console.log("firebase_test body", req.body);
  console.log("firebase_test headers", req.headers);

  var fb_log_file = fs.createWriteStream(__dirname + "/firebase.log", { flags: "a" });
  let log_obj = new Date().toLocaleString() + " " + req.ip + " " + JSON.stringify(req.body);
  fb_log_file.write(log_obj + "\n");

  res.send().status(200);
});

router.post("/register_token", (req, res, next) => {
  /*
    req,head.auth: jwt_token
    req.body ex: {
      token: <firebase token>
      device: <device name>
    }
  */

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  var filter_user = { email: token_data.email };
  let get_user_fields = { ["fb_token"]: 1 };

  // let client_ip = req.ip.replace(/\./g, ":");
  // let new_token = { [req.body.device + "-" + client_ip]: req.body.token };
  let new_token = { [req.body.device]: req.body.token };

  // Ищем юзера с email из jwt_token
  db.get(db.users_database, db.users_collection, filter_user, get_user_fields)
    .then((get_users_results) => {
      console.log("register_token get_users_results", get_users_results);

      // Достаём нужное поле по URL
      let update_token_field = {
        fb_token: Object.assign({}, get_users_results[0].fb_token, new_token),
      };
      console.log("register_token update_token_field", update_token_field);

      db.update(db.users_database, db.users_collection, filter_user, update_token_field)
        .then((results) => {
          if (!!results) {
            res.send({ message: "Данные обновлены" });
          } else {
            res.status(400).send({ message: "Данные не обновлены" });
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

router.post("/delete_token", (req, res, next) => {
  /*
    req,head.auth: jwt_token
    req.body ex: {
      device: <device name>
    }
  */

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  var filter = { email: token_data.email };
  var remove_user_fields = { ["fb_token." + req.body.device]: 1 };

  db.remove(db.users_database, db.users_collection, filter, remove_user_fields).then((result) => {
    res.send({ message: "Данные обновлены" });
  });
});

// router.post("/send", async (req, res) => {
//   console.log("firebase_send body", req.body);

//   // var user_token_data = jwt.decode(req.headers.auth, config.secret, false, 'HS256')
//   console.log("firebase send user_token", user_token_data);

//   var filter_user = { "email._V": "test" };
//   let get_secure_fields = { ["fb_token"]: 1 };
//   let get_user_fields = { email: 1 };

//   console.log("firebase_send get_user_fields", get_user_fields);
//   console.log("firebase_send get_secure_fields", get_secure_fields);

//   // Ищем юзера с email из jwt_token
//   db.get(db.users_database, db.users_collection, filter_user, get_user_fields).then((get_users_results) => {
//     console.log("firebase_send get_users_results", get_users_results);

//     var filter_secure = { user_id: get_users_results[0]._id };

//     // По нему ищем его объект в secure
//     db.get(db.secure_database, db.secure_collection, filter_secure, get_secure_fields)
//       .then((get_secure_results) => {
//         console.log("firebase_send get_secure_results", get_secure_results);

//         var registrationTokens = Object.values(get_secure_results[0].fb_token);
//         console.log("firebase_send tokens", registrationTokens);

//         const imageUri =
//           "https://e7.pngegg.com/pngimages/826/677/png-clipart-butterfly-red-butterfly-brush-footed-butterfly-photography.png";
//         const message = {
//           // token: registrationTokens[0],
//           notification: {
//             body: "This is an FCM notification that displays an image!",
//             title: "FCM Notification",
//           },
//           // data: {
//           //   score: '850',
//           //   time: '2:45'
//           // },
//           // "data": {
//           //   "title": "FCM Message",
//           //   "body": "This is an FCM Message",
//           //   "icon": "https://shortcut-test2.s3.amazonaws.com/uploads/role_image/attachment/10461/thumb_image.jpg",
//           //   "link": "https://yourapp.com/somewhere"
//           // },
//           apns: {
//             payload: {
//               aps: {
//                 "mutable-content": 1,
//               },
//             },
//             fcm_options: {
//               image: imageUri,
//             },
//           },
//           android: {
//             notification: {
//               image: imageUri,
//               icon: "stock_ticker_update",
//               color: "#FF1111",
//               sound: "default",
//               priority: "max",
//             },
//           },
//         };
//         registrationTokens.forEach((i) => {
//           messaging.send({ ...message, token: i });
//         });
//         console.log("firebase send message", message);

//         return res.send({}).status(200);
//       })
//       .catch((err) => {
//         next(err);
//       });
//   });
// });

module.exports = router;
