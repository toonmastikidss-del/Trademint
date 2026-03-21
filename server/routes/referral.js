const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Generate referral code for user
router.get('/generate-code', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate referral code based on user ID
    const referralCode = `REF${user._id.toString().slice(-6).toUpperCase()}`;
    
    // Update user with referral code if not already set
    if (!user.referralCode) {
      user.referralCode = referralCode;
      await user.save();
    }

    res.json({
      referralCode: user.referralCode,
      message: 'Referral code generated successfully'
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ error: 'Failed to generate referral code' });
  }
});

// Get user's referral statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all referrals where this user is the referrer
    const referrals = await Referral.find({ referrerId: userId })
      .populate('refereeId', 'name phone email createdAt')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const totalRewards = referrals
      .filter(r => r.rewardGiven)
      .reduce((sum, r) => sum + r.rewardAmount, 0);

    res.json({
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalRewards,
      referrals
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch referral statistics' });
  }
});

// Track referral when new user registers with referral code
router.post('/track', async (req, res) => {
  try {
    const { referralCode, userId } = req.body;

    // console.log('\n=== TRACK REFERRAL ===');
    // console.log('Referral Code:', referralCode);
    // console.log('User ID:', userId);

    if (!referralCode || !userId) {
      return res.status(400).json({ error: 'Referral code and user ID are required' });
    }

    // Find the user who owns this referral code
    const referrer = await User.findOne({ referralCode });
    console.log('Referrer found:', referrer ? {
      _id: referrer._id,
      name: referrer.name,
      referralCode: referrer.referralCode
    } : 'NOT FOUND');
    
    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Check if referral already exists
    const existingReferral = await Referral.findOne({ 
      referrerId: referrer._id, 
      refereeId: userId 
    });

    if (existingReferral) {
      // console.log('Referral already exists:', existingReferral._id);
      return res.status(400).json({ error: 'Referral already tracked' });
    }

    // Create new referral record
    const referral = new Referral({
      referrerId: referrer._id,
      refereeId: userId,
      referralCode: referralCode
    });

    await referral.save();
    
    console.log('✅ Referral created successfully:', {
      referralId: referral._id,
      referrer: referrer.name,
      referee: userId
    });
    // console.log('========================\n');

    res.json({
      message: 'Referral tracked successfully',
      referralId: referral._id
    });
  } catch (error) {
    console.error('❌ Error tracking referral:', error);
    res.status(500).json({ error: 'Failed to track referral' });
  }
});

// Get referral code for sharing
router.get('/my-code', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate referral code if not exists
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = `REF${user._id.toString().slice(-6).toUpperCase()}`;
      user.referralCode = referralCode;
      await user.save();
    }

    // Create shareable link (adjust domain as needed)
    const shareLink = `${req.protocol}://${req.get('host')}/register?ref=${referralCode}`;

    res.json({
      referralCode,
      shareLink,
      message: 'Share this link with friends to earn rewards!'
    });
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

// Apply to become an agent
router.post('/apply-agent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already an agent
    if (user.status === 'Agent' || user.role === 'agent') {
      return res.status(400).json({ error: 'You are already an agent!' });
    }

    // Check minimum balance requirement
    const AGENT_FEE = 500;
    if (user.balance < AGENT_FEE) {
      return res.status(400).json({ 
        error: `Insufficient balance. You need ₹${AGENT_FEE} to become an agent. Current balance: ₹${user.balance.toFixed(2)}` 
      });
    }

    // Check referral count (minimum 5 referrals)
    const Referral = require('../models/Referral');
    const referralCount = await Referral.countDocuments({ referrerId: userId });
    
    if (referralCount < 5) {
      return res.status(400).json({ 
        error: `You need at least 5 successful referrals to become an agent. Current referrals: ${referralCount}` 
      });
    }

    // Check account age (minimum 7 days)
    const accountAgeDays = (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
    if (accountAgeDays < 7) {
      return res.status(400).json({ 
        error: `Your account must be at least 7 days old. Current age: ${Math.floor(accountAgeDays)} days` 
      });
    }

    // Deduct fee from balance
    user.balance -= AGENT_FEE;
    
    // Update user status to Agent
    user.status = 'Agent';
    user.role = 'agent';
    
    // Add agent badge/level
    if (!user.agentDetails) {
      user.agentDetails = {};
    }
    user.agentDetails = {
      becameAgentAt: new Date(),
      agentLevel: 1,
      totalCommission: 0,
      commissionRate: 0.20 // 20% commission rate for agents
    };
    
    await user.save();

    // console.log(`✅ User ${user.name || user.phone} is now an Agent!`);
    // console.log(`   Fee deducted: ₹${AGENT_FEE}`);
    // console.log(`   New balance: ₹${user.balance.toFixed(2)}`);

    res.json({
      message: 'Congratulations! You are now an Agent!',
      agentLevel: 1,
      commissionRate: '20%',
      newBalance: user.balance
    });

  } catch (error) {
    console.error('Error processing agent application:', error);
    res.status(500).json({ error: 'Failed to process agent application' });
  }
});

module.exports = router;