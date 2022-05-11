const mongoose = require('mongoose');

const tickerSchema = mongoose.Schema({
  ticker: {type: String, required: true},
  name: {type: String, required: true}
});

module.exports = mongoose.model('Ticker', tickerSchema);