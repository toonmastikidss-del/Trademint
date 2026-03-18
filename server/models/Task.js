const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  reward: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  category: {
    type: String,
    enum: ['deposit', 'transaction', 'referral', 'other'],
    default: 'other'
  },
  targetValue: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);