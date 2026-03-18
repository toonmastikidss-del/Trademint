const mongoose = require('mongoose');

const quantifyHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  date: {
    type: Date,
    required: true
  },
  // Mode used that day
  mode: {
    type: String,
    enum: ['current', 'continue']
  },
  // Starting values at beginning of day
  startingBalance: {
    type: Number,
    default: 0
  },
  startingTotalRevenue: {
    type: Number,
    default: 0
  },
  // Earnings for the day
  earning: {
    type: Number,
    default: 0
  },
  // Final values at end of day
  endingTotalRevenue: {
    type: Number,
    default: 0
  },
  isQuantifyingActive: {
    type: Boolean,
    default: false
  },
  // Track if deposit/withdrawal happened this day
  hadDepositOrWithdrawal: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
quantifyHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('QuantifyHistory', quantifyHistorySchema);
