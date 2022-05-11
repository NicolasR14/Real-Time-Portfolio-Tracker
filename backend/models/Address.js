const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
  chain: {type: String, required: true},
  address: {type: String, required: true}
});

module.exports = mongoose.model('Address', addressSchema);