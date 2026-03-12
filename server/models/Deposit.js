const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  utrNumber: {
    type: String,
    required: true,
    unique: true // Ensure each UTR number is unique
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'pending' // pending, approved, rejected
  },
  action: {
    type: Number,
    default: 0 // 0=pending, 1=approved, 2=rejected
  },
  paymentScreenshot: {
    type: String, // Store the path to the uploaded screenshot
    default: null
  }
});

module.exports = mongoose.model('Deposit', depositSchema);