const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
  chain: {type: String, required: true},
  address: {type: String, required: true},
  name: {type: String, required: true},
  type: {type: String, required: true},
  decimals: {type: Number, required: true}
});

module.exports = mongoose.model('Contract', contractSchema);