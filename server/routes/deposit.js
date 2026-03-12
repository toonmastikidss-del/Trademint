const express = require('express');
const router = express.Router();
const Deposit = require('../models/Deposit');
const User = require('../models/User');
const Referral = require('../models/Referral');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Configure multer for screenshot upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/deposits');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'deposit-screenshot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

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

// Submit a new deposit
router.post('/submit', upload.single('paymentScreenshot'), authenticateToken, async (req, res) => {
  try {
    console.log('\n=== Deposit Submission Started ===');
    console.log('User ID:', req.user?.id);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file ? {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file uploaded');
    
    const { amount, utrNumber } = req.body;

    // Validate inputs
    if (!amount || !utrNumber) {
      console.log('Validation failed: Missing amount or utrNumber');
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Amount and UTR number are required' });
    }

    console.log('Amount:', amount, 'UTR:', utrNumber);

    // Validate UTR number format
    if (typeof utrNumber !== 'string') {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'UTR number must be a string' });
    }
    
    if (utrNumber.length !== 12) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'UTR number must be 12 digits' });
    }
    
    // Check if UTR contains only digits
    if (!/^[0-9]+$/.test(utrNumber)) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'UTR number must contain only digits' });
    }
    
    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Amount must be a valid positive number' });
    }

    // Check if UTR number already exists
    const existingDeposit = await Deposit.findOne({ utrNumber });
    if (existingDeposit) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'UTR number already exists' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle users without names - generate a name if empty
    let userName = user.name;
    if (!userName || userName.trim() === '') {
      // Generate a default name for users without names
      const prefixes = ['MEMBER', 'Trader', 'Alpha', 'Dev'];
      const suffixes = ['NNGX', 'A', '9', 'User'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      userName = `${randomPrefix}_${randomSuffix}`;
      
      // Update user with the generated name
      user.name = userName;
      await user.save();
    }

    // Prepare payment screenshot path
    let paymentScreenshotPath = null;
    if (req.file) {
      paymentScreenshotPath = `/api/deposit/screenshot/${req.file.filename}`;
    }

    // Create new deposit
    const newDeposit = new Deposit({
      userId: req.user.id,
      userName: userName,
      amount: parseFloat(amount),
      utrNumber,
      paymentScreenshot: paymentScreenshotPath,
      timestamp: new Date()
    });

    await newDeposit.save();

    console.log('✅ Deposit saved successfully:', newDeposit._id);
    console.log('=== Deposit Submission Completed ===\n');

    res.status(201).json({ 
      message: 'Deposit submitted successfully',
      deposit: newDeposit 
    });
  } catch (error) {
    console.error('Error submitting deposit:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errors: error.errors
    });
    
    // Delete uploaded file if error occurs
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Deleted uploaded file due to error');
      } catch (deleteErr) {
        console.error('Error deleting file:', deleteErr);
      }
    }
    
    if (error.code === 11000) {
      // Duplicate key error
      res.status(400).json({ error: 'UTR number already exists' });
    } else if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(err => err.message);
      res.status(400).json({ error: messages.join(', ') });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

// Get deposits for a specific user
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the requesting user is authorized to view these deposits
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view these deposits' });
    }

    const deposits = await Deposit.find({ userId })
      .sort({ timestamp: -1 }); // Sort by newest first

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all deposits (for admin panel)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const deposits = await Deposit.find()
      .sort({ timestamp: -1 }); // Sort by newest first

    res.json(deposits);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deposit status (for admin)
router.put('/status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    // Check if user is admin by checking role
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    // Store old status to check if it changed
    const oldStatus = deposit.status;
    
    // Update the action status
    deposit.action = action;
    
    // Also update the status based on action
    if (action === 1) {
      deposit.status = 'approved';
    } else if (action === 2) {
      deposit.status = 'rejected';
    } else {
      deposit.status = 'pending';
    }

    await deposit.save();

    // If deposit was approved and it was previously pending, update user's balance
    if (action === 1 && oldStatus !== 'approved') {
      const user = await User.findById(deposit.userId);
      if (user) {
        const oldBalance = user.balance;
        user.balance += deposit.amount;
        // Update user.quantify immediately with new balance
        user.quantify = user.balance;
        await user.save();
        
        console.log('✅ Deposit Approved:');
        console.log('   Amount:', deposit.amount);
        console.log('   Old Balance:', oldBalance.toFixed(2));
        console.log('   New Balance:', user.balance.toFixed(2));
        console.log('   Updated user.quantify:', user.quantify.toFixed(2));
        
        // Update quantify data to reflect new balance
        const Quantify = require('../models/Quantify');
        let quantifyData = await Quantify.findOne({ userId: user._id });
        
        if (quantifyData) {
          // Check if quantifying was active
          const wasQuantifyingActive = quantifyData.isQuantifying;
          
          // Switch to Current mode when deposit happens
          quantifyData.mode = 'current';
          quantifyData.balance = user.balance; // Update to new balance
          quantifyData.totalRevenue = user.balance; // Reset total revenue to new balance
          quantifyData.todayEarning = 0; // Reset today's earning
          quantifyData.lastActivityDate = new Date();
          
          // If quantifying was active, automatically start calculating earnings
          if (wasQuantifyingActive) {
            const earning = user.balance * 0.06;
            quantifyData.todayEarning = earning;
            quantifyData.totalRevenue = user.balance + earning;
            quantifyData.isQuantifying = true;
            
            // Update user.quantify with new totalRevenue
            user.quantify = quantifyData.totalRevenue;
            await user.save();
            
            console.log('📊 Quantifying was active - recalculated earnings:');
            console.log('   Today Earning:', earning.toFixed(2));
            console.log('   Total Revenue:', quantifyData.totalRevenue.toFixed(2));
            console.log('   Updated user.quantify:', user.quantify.toFixed(2));
          }
          
          await quantifyData.save();
        }
      }

      // Check for referral rewards
      try {
        // Find if this user was referred by someone
        const referral = await Referral.findOne({ 
          refereeId: deposit.userId,
          status: 'pending' 
        }).populate('referrerId');

        if (referral && referral.referrerId) {
          // Add referral reward to referrer's balance
          const referrer = referral.referrerId;
          const oldBalance = referrer.balance;
          referrer.balance += referral.rewardAmount;
          
          console.log('📊 Referral Reward Added:');
          console.log('   Referrer:', referrer._id);
          console.log('   Old Balance:', oldBalance);
          console.log('   New Balance:', referrer.balance);
          console.log('   Referral Reward Amount:', referral.rewardAmount);
          
          // Update referrer's quantify field immediately with new balance
          referrer.quantify = referrer.balance;
          await referrer.save();
          console.log('   Updated user.quantify (to balance):', referrer.quantify.toFixed(2));
          
          // ALSO update quantify data for the referrer if quantifying was active
          const QuantifyModel = require('../models/Quantify');
          let referrerQuantifyData = await QuantifyModel.findOne({ userId: referrer._id });
          
          if (referrerQuantifyData) {
            const wasQuantifyingActive = referrerQuantifyData.isQuantifying;
            
            // Switch to Current mode when referral reward happens
            referrerQuantifyData.mode = 'current';
            referrerQuantifyData.balance = referrer.balance; // Update to new balance
            referrerQuantifyData.totalRevenue = referrer.balance; // Reset total revenue to new balance
            referrerQuantifyData.todayEarning = 0; // Reset today's earning
            referrerQuantifyData.lastActivityDate = new Date();
            
            // If quantifying was active, automatically start calculating earnings
            if (wasQuantifyingActive) {
              const earning = referrer.balance * 0.06;
              referrerQuantifyData.todayEarning = earning;
              referrerQuantifyData.totalRevenue = referrer.balance + earning;
              referrerQuantifyData.isQuantifying = true;
              
              // Update user.quantify with new totalRevenue
              referrer.quantify = referrerQuantifyData.totalRevenue;
              await referrer.save();
              
              console.log('📊 Quantifying was active for referrer - recalculated earnings:');
              console.log('   Today Earning:', earning.toFixed(2));
              console.log('   Total Revenue:', referrerQuantifyData.totalRevenue.toFixed(2));
              console.log('   Updated user.quantify (to totalRevenue):', referrer.quantify.toFixed(2));
            }
            
            await referrerQuantifyData.save();
          }
        }
      } catch (referralError) {
        console.error('Error processing referral reward:', referralError);
      }
      try {
        // This is a local call, so we'll directly call the logic instead of making an HTTP request
        const token = jwt.sign({ id: deposit.userId }, process.env.JWT_SECRET);
        // We already handled the recalculation above, so no need to duplicate
      } catch (recalcError) {
        console.error('Error in deposit recalculation:', recalcError);
      }
    }

    res.json({ 
      message: 'Deposit status updated successfully',
      deposit 
    });
  } catch (error) {
    console.error('Error updating deposit status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve deposit screenshot
router.get('/screenshot/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/deposits', filename);
    
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ message: 'Screenshot not found' });
    }
  } catch (err) {
    console.error('Error serving screenshot:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all deposits (Admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Verify admin token
    const adminToken = req.headers.authorization?.split(' ')[1];
    if (!adminToken) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const decoded = jwt.verify(adminToken, process.env.JWT_ADMIN_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const deposits = await Deposit.find().sort({ timestamp: -1 }).populate('userId', 'name phone email');
    res.json(deposits);
  } catch (error) {
    console.error('Error fetching all deposits:', error);
    res.status(500).json({ error: 'Failed to fetch deposits' });
  }
});

module.exports = router;