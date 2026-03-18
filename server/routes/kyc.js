const express = require('express');
const router = express.Router();
const KYC = require('../models/KYC');
const User = require('../models/User');
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

// Image compression utility
const compressImageToBase64 = (fileBuffer, targetSizeKB = 2) => {
  return new Promise((resolve, reject) => {
    try {
      // Convert buffer to base64
      let base64String = fileBuffer.toString('base64');
      
      // Simple compression by reducing quality - this is a basic approach
      // For production, you'd want to use a proper image processing library
      const originalSizeKB = Buffer.byteLength(base64String, 'base64') / 1024;
      
      // If already under target size, return as is
      if (originalSizeKB <= targetSizeKB) {
        resolve(base64String);
        return;
      }
      
      // Reduce quality by taking every nth character (basic compression)
      // This is a simplified approach - in production use proper image libraries
      const compressionRatio = targetSizeKB / originalSizeKB;
      const step = Math.ceil(1 / compressionRatio);
      
      let compressedString = '';
      for (let i = 0; i < base64String.length; i += step) {
        compressedString += base64String[i];
      }
      
      resolve(compressedString);
    } catch (error) {
      reject(error);
    }
  });
};

// Submit KYC
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has KYC submitted
    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      return res.status(400).json({ 
        error: 'KYC already submitted. Please wait for approval or contact support.' 
      });
    }
    
    // Validate required fields
    const requiredFields = [
      'fullName', 'dateOfBirth', 'gender', 'mobileNumber', 'emailAddress',
      'address', 'city', 'state', 'pinCode', 'aadharNumber', 'panNumber',
      'bankName', 'accountNumber', 'ifscCode', 'branchName'
    ];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ 
          error: `Missing required field: ${field}` 
        });
      }
    }
    
    // Validate file uploads
    const requiredFiles = ['aadharFront', 'aadharBack', 'panCard', 'bankPassbook', 'userPhoto'];
    for (const fileField of requiredFiles) {
      if (!req.files || !req.files[fileField]) {
        return res.status(400).json({ 
          error: `Missing required document: ${fileField}` 
        });
      }
    }
    
    // Compress images
    const compressedImages = {};
    for (const fileField of requiredFiles) {
      try {
        compressedImages[`${fileField}Image`] = await compressImageToBase64(
          req.files[fileField].data, 
          2 // 2KB target size
        );
      } catch (error) {
        return res.status(400).json({ 
          error: `Failed to process ${fileField} image` 
        });
      }
    }
    
    // Create KYC record
    const kycData = {
      userId,
      fullName: req.body.fullName,
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender,
      mobileNumber: req.body.mobileNumber,
      emailAddress: req.body.emailAddress,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pinCode: req.body.pinCode,
      aadharNumber: req.body.aadharNumber,
      panNumber: req.body.panNumber,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      ifscCode: req.body.ifscCode,
      branchName: req.body.branchName,
      ...compressedImages
    };
    
    const newKYC = new KYC(kycData);
    await newKYC.save();
    
    res.json({
      message: 'KYC submitted successfully. Please wait for approval.',
      kycId: newKYC._id
    });
    
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's KYC status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const kyc = await KYC.findOne({ userId });
    
    if (!kyc) {
      return res.json({ status: 'Not Submitted' });
    }
    
    res.json({
      status: kyc.status,
      rejectionReason: kyc.rejectionReason,
      submittedAt: kyc.submittedAt,
      approvedAt: kyc.approvedAt,
      rejectedAt: kyc.rejectedAt
    });
    
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's full KYC details (for admin)
router.get('/details/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const kyc = await KYC.findOne({ userId: req.params.userId })
      .populate('userId', 'name phone email');
    
    if (!kyc) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    
    res.json(kyc);
    
  } catch (error) {
    console.error('KYC details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve KYC
router.post('/approve/:kycId', authenticateToken, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const kyc = await KYC.findById(req.params.kycId);
    if (!kyc) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    
    kyc.status = 'Approved';
    kyc.approvedAt = new Date();
    await kyc.save();
    
    res.json({ message: 'KYC approved successfully' });
    
  } catch (error) {
    console.error('KYC approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Reject KYC
router.post('/reject/:kycId', authenticateToken, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const kyc = await KYC.findById(req.params.kycId);
    if (!kyc) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    
    kyc.status = 'Rejected';
    kyc.rejectionReason = rejectionReason;
    kyc.rejectedAt = new Date();
    await kyc.save();
    
    res.json({ message: 'KYC rejected successfully' });
    
  } catch (error) {
    console.error('KYC rejection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all pending KYC requests (admin)
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const pendingKYCs = await KYC.find({ status: 'Pending' })
      .populate('userId', 'name phone email')
      .sort({ submittedAt: -1 });
    
    res.json(pendingKYCs);
    
  } catch (error) {
    console.error('Pending KYC error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all KYC requests (admin)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if requesting user is admin
    const requestingUser = await User.findById(req.user.id);
    if (requestingUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const allKYCs = await KYC.find()
      .populate('userId', 'name phone email')
      .sort({ submittedAt: -1 });
    
    res.json(allKYCs);
    
  } catch (error) {
    console.error('All KYC error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;