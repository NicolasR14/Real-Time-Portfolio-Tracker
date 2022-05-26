const mongoose = require("mongoose");

const lastBalanceSchema = mongoose.Schema({
  balances: { type: Array, required: true },
  last_updated: { type: Number, required: true },
  lp_list: { type: Array, required: true },
  total: {
    usd: { type: Number, required: true },
    eth: { type: Number, required: true },
    eur: { type: Number, required: true },
    btc: { type: Number, required: true },
    main: { type: Number, required: true },
  },
});

module.exports = mongoose.model("LastBalance", lastBalanceSchema);
