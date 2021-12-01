const express = require("express");
const router = express.Router();
const db = require("../../db/db");
const db_operations = require("./repository");

// Get existed user
router.post("/get", async (req, res, next) => {
  await db_operations
    .get(req, db.users_database, db.schedules_collection, next)
    .then((data) => {
      console.log("SCHEDULE get response", data);
      res.send(data);
    });
});

router.post("/update", async (req, res, next) => {
  await db_operations
    .update(req, db.users_database, db.schedules_collection, next)
    .then((data) => {
      console.log("SCHEDULE update response", data);
      res.send(data);
    });
});

router.post("/remove", async (req, res, next) => {
  await db_operations
    .remove(req, db.users_database, db.schedules_collection, next)
    .then((data) => {
      console.log("SCHEDULE remove response", data);
      res.send(data);
    });
});

module.exports = router;
