const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  taskId: {
    type: String,
    required: true,
    ref: 'Task'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'claimed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  claimedAt: {
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

// Update the updatedAt field before saving
userTaskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserTask', userTaskSchema);