const express = require("express");
const router = express.Router();
const jwt = require("jwt-simple");

const db = require("../db/db");
const config = require("../config/config");
const { val_key, time_key, wrap, unwrap } = require("../db/wrapper");

/* === Select fields from ALL === */

router.post("/find", (req, res, next) => {
  /*
    req.body ex: {
      "value": <find str>, // ex: Fam Nam Otch
    }
  */

  console.log("find user GET CUR req.body", req.body);

  let target_path_list = [
    "username._V",
    "personal._V.FirstName._V",
    "personal._V.MiddleName._V",
    "personal._V.LastName._V",
  ];
  let target_words = req.body.value.toLowerCase().split(" ");
  let query_fields = [];
  for (let word in target_words) {
    let filter_fields = [];
    for (let field in target_path_list)
      filter_fields.push({
        [target_path_list[field]]: {
          $regex: target_words[word],
          $options: "-i",
        },
      });
    query_fields.push({ $or: filter_fields });
  }
  // console.log('find user GET CUR query_fields', query_fields)

  var filter = { $and: query_fields };
  var fields = {
    email: 1,
    username: 1,
    personal: 1,
  };

  // console.log('find user GET CUR filter', filter)
  // res.send(filter);

  db.get(db.users_database, db.users_collection, filter, fields)
    .then((results) => {
      // console.log('find user GET CUR results', results)
      // console.log('unwrap', unwrap(results[0]))
      if (results.length)
        res.send(
          results.map((item) =>
            unwrap({
              [val_key]: item,
              [time_key]: null,
            })
          )
        );
      else res.send({});

      // Достаём по url нужное вложенное поле из результата
      let results_found_field = results[0];
      let urls;
    })
    .catch((err) => {
      next(err);
    });
});

/* === FULL ITEMS BLOCK === */

// Delete existed user
router.post("/delete", (req, res, next) => {
  console.log("DELETE ANY req.body", req.body);
  console.log("DELETE ANY req.headers", req.headers);

  var token_data = jwt.decode(req.headers.auth, config.secret, false, "HS256");
  console.log("DELETE ANY token_data", token_data);

  if (!!token_data && (token_data.role == 0 || unwrap(token_data.email) == req.body.email)) {
    var filter = { ["email." + val_key]: req.body.email };
    var fields_user = { _id: 1 };

    // Remove profile
    db.get(db.users_database, db.users_collection, filter, fields_user)
      .then((get_results) => {
        db.delete(db.users_database, db.users_collection, filter)
          .then((del_user_results) => {
            db.delete(db.secure_database, db.secure_collection, { user_id: get_results[0]._id }).catch((err) =>
              next(err)
            );
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));

    db.delete(db.users_database, db.diaries_collection, filter).catch((err) => next(err));
    db.delete(db.users_database, db.medicaments_collection, filter).catch((err) => next(err));
    db.delete(db.users_database, db.schedules_collection, filter).catch((err) => next(err));
  } else {
    const err = new Error("Нет прав на удаление!");
    err.status = 403;
    next(err);
  }
});

module.exports = router;
