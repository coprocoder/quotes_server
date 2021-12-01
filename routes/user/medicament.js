const express = require("express");
const router = express.Router();

const db = require("../../db/db");
const db_operations = require("./repository");

// Get existed user
router.post("/get", async (req, res, next) => {
  await db_operations
    .get(req, db.users_database, db.medicaments_collection, next)
    .then((data) => {
      console.log("MEDICAMENTS get response", data);
      res.send(data);
    });
});

router.post("/update", async (req, res, next) => {
  await db_operations
    .update(req, db.users_database, db.medicaments_collection, next)
    .then((data) => {
      console.log("MEDICAMENTS update response", data);
      res.send(data);
    });
});

router.post("/remove", async (req, res, next) => {
  await db_operations
    .remove(req, db.users_database, db.medicaments_collection, next)
    .then((data) => {
      console.log("MEDICAMENTS remove response", data);
      res.send(data);
    });
});

module.exports = router;
