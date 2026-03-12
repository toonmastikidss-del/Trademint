const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  // User who made the referral (referrer)
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // User who was referred (referee)
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Referral code used
  referralCode: {
    type: String,
    required: true
  },
  
  // Status of referral
  status: {
    type: String,
    enum: ['pending', 'completed', 'rewarded'],
    default: 'pending'
  },
  
  // Reward amount
  rewardAmount: {
    type: Number,
    default: 100
  },
  
  // Whether reward has been given
  rewardGiven: {
    type: Boolean,
    default: false
  },
  
  // Deposit that triggered the reward
  depositId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deposit'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: {
    type: Date
  },
  
  rewardedAt: {
    type: Date
  }
});

// Index for faster queries
referralSchema.index({ referrerId: 1 });
referralSchema.index({ refereeId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

module.exports = mongoose.model('Referral', referralSchema);