const mongoose = require("mongoose");

const lastBalanceSchema = mongoose.Schema({
  balances: { type: Array, required: true },
  last_updated: { type: Number, required: true },
});

module.exports = mongoose.model("LastBalance", lastBalanceSchema);
