
const mongoose = require('mongoose');

module.exports = mongoose.model('Admin', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}, { timestamps: true }));
