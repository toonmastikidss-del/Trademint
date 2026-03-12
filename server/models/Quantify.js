const mongoose = require('mongoose');

const quantifySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
    unique: true
  },
  // Current mode: 'current' or 'continue'
  mode: {
    type: String,
    enum: ['current', 'continue'],
    default: 'current'
  },
  // Financial data
  balance: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  todayEarning: {
    type: Number,
    default: 0
  },
  isQuantifying: {
    type: Boolean,
    default: false
  },
  // Track last activity date for continue mode
  lastActivityDate: {
    type: Date,
    default: Date.now
  },
  // Midnight reset tracking
  lastResetDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
quantifySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Quantify', quantifySchema);
