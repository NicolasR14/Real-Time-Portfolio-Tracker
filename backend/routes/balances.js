const express = require("express");
const router = express.Router();
const balancesCtrl = require("../controllers/balances");
const rateLimiter = require("../middlewares/rate_limit");

router.get("/", rateLimiter, balancesCtrl.getAllBalances);
module.exports = router;
