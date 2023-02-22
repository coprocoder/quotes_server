const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/quotes", async (req, res, next) => {
  const url = "https://poloniex.com/public?command=returnTicker";
  const result = await axios(url);
  res.send(result?.data || {});
});

module.exports = router;
