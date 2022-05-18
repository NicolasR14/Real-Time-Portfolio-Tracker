const mongoose = require("mongoose");

const lastBalanceSchema = mongoose.Schema({
  balances: { type: Array, required: true },
  last_updated: { type: Number, required: true },
  lp_list: { type: Array, required: true },
  total_usd: { type: Number, required: true },
});

module.exports = mongoose.model("LastBalance", lastBalanceSchema);
