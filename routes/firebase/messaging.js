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
      // Достаём нужное поле по URL
      let update_token_field = {
        fb_token: Object.assign({}, get_users_results[0].fb_token, new_token),
      };

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

module.exports = router;
