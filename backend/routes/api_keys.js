const express = require("express");
const router = express.Router();
const api_keysCtrl = require("../controllers/api_keys");
router.post("/", api_keysCtrl.createAPI_key);
router.get("/", api_keysCtrl.getAllAPI_key);
router.delete("/:id", api_keysCtrl.deleteAPI_key);

module.exports = router;
