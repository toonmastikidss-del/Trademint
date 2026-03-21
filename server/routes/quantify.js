const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Quantify = require('../models/Quantify');
const QuantifyHistory = require('../models/QuantifyHistory');
const Deposit = require('../models/Deposit');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get server time
router.get('/time', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timestamp: Date.now()
  });
});

// Get user's quantify data
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    const userBalance = user?.balance || 0;
    
    // Get quantify data
    let quantifyData = await Quantify.findOne({ userId });
    
    // console.log('=== RAW DB DATA BEFORE ANY LOGIC ===');
    // console.log('Found quantifyData:', quantifyData ? 'YES' : 'NO');
    if (quantifyData) {
      // console.log('  _id:', quantifyData._id);
      // console.log('  isQuantifying:', quantifyData.isQuantifying);
      // console.log('  totalRevenue:', quantifyData.totalRevenue);
      // console.log('  todayEarning:', quantifyData.todayEarning);
      // console.log('  mode:', quantifyData.mode);
      // console.log('  lastResetDate:', quantifyData.lastResetDate);
      // console.log('  balance:', quantifyData.balance);
    }
    // console.log('=====================================');
    
    if (!quantifyData) {
      // First time - initialize with current mode
      quantifyData = new Quantify({
        userId,
        mode: 'current',
        balance: userBalance,
        totalRevenue: userBalance,
        todayEarning: 0,
        isQuantifying: false,
        lastActivityDate: new Date()
      });
      await quantifyData.save();
    }
    
    // ✅ IMPROVED: Check karo ki cron job ne reset kiya ya nahi
    // Agar lastResetDate aaj ki hai toh cron job already reset kar chuka hai
    // Agar nahi hai toh backup reset karo (safety net)
    const now = new Date();
    const lastReset = quantifyData.lastResetDate;

    // IST mein date compare karo
    const toISTDateString = (date) => {
      return new Date(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    };

    const todayIST = toISTDateString(now);
    const lastResetIST = lastReset ? toISTDateString(lastReset) : null;

    const isNewDay = !lastResetIST || lastResetIST !== todayIST;
    
    // Only reset if it's a new day AND quantifying was not active
    const hasRecentActivity = quantifyData.lastActivityDate && 
      (now - new Date(quantifyData.lastActivityDate)) < 60000; // 1 minute
    
    if (isNewDay && !quantifyData.isQuantifying && !hasRecentActivity) {
      // console.log('⚠️ BACKUP RESET: Cron job missed, resetting now for user:', userId);
      
      // Save yesterday's history before resetting
      if (quantifyData.totalRevenue > 0 && quantifyData.todayEarning > 0) {
        await QuantifyHistory.create({
          userId,
          date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
          mode: quantifyData.mode,
          startingBalance: quantifyData.balance,
          startingTotalRevenue: quantifyData.totalRevenue - quantifyData.todayEarning,
          earning: quantifyData.todayEarning,
          endingTotalRevenue: quantifyData.totalRevenue,
          isQuantifyingActive: false,
          hadDepositOrWithdrawal: false
        });
      }
      
      // Reset for new day - Continue mode
      quantifyData.mode = 'continue';
      quantifyData.todayEarning = 0;
      quantifyData.isQuantifying = false;
      quantifyData.lastResetDate = now;
      quantifyData.lastActivityDate = now;
      await quantifyData.save();

      // console.log('✅ BACKUP RESET: Done for user:', userId);
    }
    
    // console.log('=== GET /user/:userId ===');
    // console.log('User ID:', userId);
    // console.log('Is Quantifying:', quantifyData.isQuantifying);
    // console.log('Total Revenue:', quantifyData.totalRevenue);
    // console.log('Today Earning:', quantifyData.todayEarning);
    // console.log('Mode:', quantifyData.mode);
    // console.log('Last Reset:', quantifyData.lastResetDate);
    // console.log('========================');

    res.json({
      balance: userBalance,
      totalRevenue: quantifyData.totalRevenue,
      todayEarning: quantifyData.todayEarning,
      isQuantifying: quantifyData.isQuantifying,
      mode: quantifyData.mode
    });

  } catch (error) {
    console.error('Error fetching quantify data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start quantifying
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    const userBalance = user?.balance || 0;
    
    if (userBalance < 600) {
      return res.status(400).json({ 
        error: 'Please recharge your account first before starting to quantify!' 
      });
    }
    
    let quantifyData = await Quantify.findOne({ userId });
    
    if (!quantifyData) {
      // First time - Current mode
      const earning = userBalance * 0.06;
      const newTotalRevenue = userBalance + earning;
      
      quantifyData = new Quantify({
        userId,
        mode: 'current',
        balance: userBalance,
        totalRevenue: newTotalRevenue,
        todayEarning: earning,
        isQuantifying: true,
        lastActivityDate: new Date()
      });
      
      // ⭐ IMMEDIATELY update user.quantify with totalRevenue
      user.quantify = newTotalRevenue;
      await user.save();
      // console.log('✅ FIRST TIME QUANTIFY: user.quantify updated to', newTotalRevenue);
      
    } else {
      // Check if balance changed
      const balanceChanged = quantifyData.balance !== userBalance;
      
      if (balanceChanged) {
        // Balance changed - Switch to Current mode, reset Total Revenue to balance
        quantifyData.mode = 'current';
        quantifyData.balance = userBalance;
        quantifyData.totalRevenue = userBalance;
        quantifyData.todayEarning = 0;
      }
      
      // SIMPLE COMPOUND LOGIC: Always calculate from Total Revenue
      // Today's Earning = Total Revenue × 6%
      const earning = quantifyData.totalRevenue * 0.06;
      
      // New Total Revenue = Total Revenue + Today's Earning
      const newTotalRevenue = quantifyData.totalRevenue + earning;
      
      // Update values
      quantifyData.todayEarning = earning;
      quantifyData.totalRevenue = newTotalRevenue;
      quantifyData.isQuantifying = true;
      quantifyData.lastActivityDate = new Date();
      
      // ⭐ IMMEDIATELY update user.quantify with new totalRevenue
      user.quantify = newTotalRevenue;
      await user.save();
      // console.log('✅ START QUANTIFYING: user.quantify updated to', newTotalRevenue);
      // console.log('   Balance:', userBalance);
      // console.log('   Total Revenue:', newTotalRevenue);
      // console.log('   Today Earning:', earning);
      // console.log('   Was Balance Changed:', balanceChanged);
    }
    
    await quantifyData.save();
    
    // console.log('=== START QUANTIFYING ===');
    // console.log('User ID:', userId);
    // console.log('Saved Is Quantifying:', quantifyData.isQuantifying);
    // console.log('Saved Total Revenue:', quantifyData.totalRevenue);
    // console.log('Saved Today Earning:', quantifyData.todayEarning);
    // console.log('Saved Mode:', quantifyData.mode);
    // console.log('========================');
    
    res.json({
      message: 'Quantifying started successfully',
      balance: userBalance,
      totalRevenue: quantifyData.totalRevenue,
      todayEarning: quantifyData.todayEarning,
      isQuantifying: true,
      mode: quantifyData.mode
    });

  } catch (error) {
    console.error('Error starting quantifying:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Midnight reset endpoint (called at 11:59 PM - 12:01 AM)
router.post('/midnight-reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const quantifyData = await Quantify.findOne({ userId });
    
    if (!quantifyData) {
      return res.status(404).json({ error: 'No quantify data found' });
    }
    
    const now = new Date();
    
    // Save today's history
    await QuantifyHistory.create({
      userId,
      date: now,
      mode: quantifyData.mode,
      startingBalance: quantifyData.balance,
      startingTotalRevenue: quantifyData.totalRevenue - quantifyData.todayEarning,
      earning: quantifyData.todayEarning,
      endingTotalRevenue: quantifyData.totalRevenue,
      isQuantifyingActive: quantifyData.isQuantifying,
      hadDepositOrWithdrawal: false
    });
    
    // ⭐ NOTE: user.quantify column update has been disabled
    const user = await User.findById(userId);
    if (user) {
      // console.log('✅ MIDNIGHT RESET: user.quantify update skipped (disabled by system config)');
      // console.log('   Current totalRevenue:', quantifyData.totalRevenue);
      // console.log('   Current user.quantify:', user.quantify);
    }
    
    // Reset for new day - will be Continue mode
    quantifyData.mode = 'continue';
    quantifyData.todayEarning = 0;
    quantifyData.isQuantifying = false;
    quantifyData.lastResetDate = now;
    quantifyData.lastActivityDate = now;
    await quantifyData.save();
    
    res.json({
      message: 'Midnight reset successful',
      totalRevenue: quantifyData.totalRevenue,
      mode: quantifyData.mode
    });

  } catch (error) {
    console.error('Error in midnight reset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Activity tracking for deposit/withdrawal
router.post('/track-activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    let quantifyData = await Quantify.findOne({ userId });
    
    if (!quantifyData) {
      return res.status(404).json({ error: 'No quantify data found' });
    }
    
    // When deposit/withdrawal happens, switch to Current mode
    quantifyData.mode = 'current';
    quantifyData.lastActivityDate = new Date();
    await quantifyData.save();
    
    res.json({
      message: 'Activity tracked',
      mode: quantifyData.mode
    });

  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quantify history (for users - their own history, for admin - all history)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { page = 1, limit = 30 } = req.query;
    
    // If user is admin, show all history; otherwise show only their own
    const query = (user.status === 'Admin') ? {} : { userId: req.user.id };
    
    const history = await QuantifyHistory.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await QuantifyHistory.countDocuments(query);
    
    res.json({
      history,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if 24 hours have passed since first quantifying
router.get('/check-24hrs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const quantifyData = await Quantify.findOne({ userId });
    
    if (!quantifyData || !quantifyData.createdAt) {
      return res.json({
        hasCompleted24Hours: false,
        hoursRemaining: 24,
        secondsRemaining: 24 * 60 * 60,
        message: 'Please start quantifying first'
      });
    }
    
    const now = new Date();
    const startTime = new Date(quantifyData.createdAt);
    const diffMs = now - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours >= 24) {
      return res.json({
        hasCompleted24Hours: true,
        hoursRemaining: 0,
        secondsRemaining: 0,
        message: '24 hours completed'
      });
    }
    
    const hoursRemaining = 24 - diffHours;
    const secondsRemaining = (24 * 60 * 60) - (diffMs / 1000);
    
    res.json({
      hasCompleted24Hours: false,
      hoursRemaining: Math.max(0, hoursRemaining),
      secondsRemaining: Math.max(0, secondsRemaining),
      timeStarted: startTime,
      message: `${hoursRemaining.toFixed(2)} hours remaining`
    });
    
  } catch (error) {
    console.error('Error checking restriction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DEBUG: Manually create a test history record (remove in production)
router.post('/debug/create-test-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const testHistory = await QuantifyHistory.create({
      userId,
      date: new Date(),
      mode: 'current',
      startingBalance: 1000,
      startingTotalRevenue: 1000,
      earning: 60,
      endingTotalRevenue: 1060,
      isQuantifyingActive: false,
      hadDepositOrWithdrawal: false
    });
    
    // console.log('🧪 DEBUG: Created test history record:', testHistory._id);
    
    res.json({
      message: 'Test history record created',
      record: testHistory
    });
  } catch (error) {
    console.error('Error creating test history:', error);
    res.status(500).json({ error: 'Failed to create test history' });
  }
});

module.exports = router;