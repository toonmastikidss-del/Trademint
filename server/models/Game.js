const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Casual', 'Skill', 'Luck', 'Multiplayer'],
    default: 'Casual'
  },
  minBet: {
    type: Number,
    default: 10
  },
  maxBet: {
    type: Number,
    default: 10000
  },
  totalPlayers: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rules: {
    type: String,
    required: true
  },
  winRate: {
    type: Number,
    default: 0.5 // 50% win rate
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);
