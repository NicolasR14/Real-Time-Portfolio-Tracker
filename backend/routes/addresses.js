const express = require("express");
const router = express.Router();
const addressesCtrl = require("../controllers/addresses");
router.post("/", addressesCtrl.createAddress);
router.get("/", addressesCtrl.getAllAddresses);
router.delete("/:id", addressesCtrl.deleteAddress);
module.exports = router;
