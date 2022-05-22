const mongoose = require("mongoose");

const histoSchema = mongoose.Schema({
  day: { type: Number, required: true },
  balance: { type: Number, required: true },
  balance_eth: { type: Number, required: true },
  balance_btc: { type: Number, required: true },
  balance_eur: { type: Number, required: true },
});

module.exports = mongoose.model("Histo", histoSchema);
