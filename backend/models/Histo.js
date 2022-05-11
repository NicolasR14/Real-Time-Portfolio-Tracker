const mongoose = require("mongoose");

const histoSchema = mongoose.Schema({
  day: { type: Number, required: true },
  balance: { type: Number, required: true },
});

module.exports = mongoose.model("Histo", histoSchema);
