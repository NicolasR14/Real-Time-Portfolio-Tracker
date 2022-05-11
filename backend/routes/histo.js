const express = require("express");
const router = express.Router();
const histoCtrl = require("../controllers/histo");
router.get("/", histoCtrl.getAllHisto);

module.exports = router;
