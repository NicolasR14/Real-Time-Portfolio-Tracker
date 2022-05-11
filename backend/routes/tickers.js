const express = require("express");
const router = express.Router();
const tickersCtrl = require("../controllers/tickers");
router.get("/", tickersCtrl.getAllTickers);
router.post("/", tickersCtrl.createTicker);
router.delete("/:id", tickersCtrl.deleteTicker);

module.exports = router;
