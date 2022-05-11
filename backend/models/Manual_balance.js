const mongoose = require("mongoose");

const manBalanceSchema = mongoose.Schema({
  type: { type: String, required: true },
  asset: { type: String, required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model("ManBalance", manBalanceSchema);
