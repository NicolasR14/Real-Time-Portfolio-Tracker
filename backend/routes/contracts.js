const express = require("express");
const router = express.Router();
const contractsCtrl = require("../controllers/contracts");
router.post("/", contractsCtrl.createContract);
router.get("/", contractsCtrl.getAllContracts);
router.delete("/:id", contractsCtrl.deleteContract);
module.exports = router;
