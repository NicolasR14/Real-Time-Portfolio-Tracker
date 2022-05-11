const express = require('express');
const router = express.Router();
const balancesCtrl = require('../controllers/balances')
router.get('/',balancesCtrl.getAllBalances);

module.exports = router;