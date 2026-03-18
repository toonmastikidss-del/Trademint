const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const User = require('../models/User');
const Game = require('../models/Game');

// Get all active games
router.get('/', authenticateToken, async (req, res) => {
  try {
    const games = await Game.find({ isActive: true }).sort({ totalPlayers: -1 });
    res.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's game history (placeholder for now)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement game history tracking
    res.json({ 
      history: [],
      stats: {
        totalGamesPlayed: 0,
        winRate: 0,
        totalEarnings: 0,
        currentStreak: 0
      }
    });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
