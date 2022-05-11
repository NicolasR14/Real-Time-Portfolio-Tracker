const express = require("express");
const router = express.Router();
const manBalCtrl = require("../controllers/manual_balance");
router.post("/", manBalCtrl.createManBal);
router.get("/", manBalCtrl.getAllManBal);
router.delete("/:id", manBalCtrl.deleteManBal);
module.exports = router;
