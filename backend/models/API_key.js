const mongoose = require('mongoose');

const api_keySchema = mongoose.Schema({
  name: {type: String, required: true},
  api_key: {
    iv: {type: String, required: true},
    encryptedData: {type: String, required: true}
  },
  api_secret: {
    iv: {type: String, required: false},
    encryptedData: {type: String, required: false},
    required: false
  },
  api_passphrase:{
    iv: {type: String, required: false},
    encryptedData: {type: String, required: false},
    required: false
  }
});

module.exports = mongoose.model('API_key', api_keySchema);