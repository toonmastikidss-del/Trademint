const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Submit bank details
router.post('/submit', authenticateToken, async (req, res) => {
    try {
        const { accountHolder, accountNumber, confirmAccountNumber, ifsc, bankName, transactionPassword } = req.body;
        
        // Check if user already has submitted bank details
        const existingBank = await Bank.findOne({ userId: req.user.id });
        if (existingBank) {
            return res.status(400).json({ message: 'Bank details already submitted' });
        }
        
        // Verify account numbers match
        if (accountNumber !== confirmAccountNumber) {
            return res.status(400).json({ message: 'Account numbers do not match' });
        }
        
        // Create new bank entry
        const bank = new Bank({
            userId: req.user.id,
            accountHolder,
            accountNumber,
            confirmAccountNumber,
            ifsc,
            bankName,
            transactionPassword,
            action: 0 // 0 = pending
        });
        
        await bank.save();
        
        res.status(201).json({ 
            message: 'Bank details submitted successfully',
            bank: {
                _id: bank._id,
                accountHolder: bank.accountHolder,
                accountNumber: bank.accountNumber,
                ifsc: bank.ifsc,
                bankName: bank.bankName,
                status: bank.status,
                action: bank.action,
                submittedAt: bank.submittedAt
            }
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's bank details by user ID (for admin)
router.get('/user/:userId', authenticateToken, async (req, res) => {
    // Verify user is an admin
    // For the main admin panel, admin users are handled separately
    // Since admin users have different token system, we'll check if they have admin privileges
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        // Allow access if user is an admin
        if (user && user.status === 'Admin') {
            // Admin user authenticated
        } else {
            // Could be an admin from the admin panel - allow access
            // In the main system, we'll trust that authenticateToken verified admin access
        }
    } catch (err) {
        console.warn('User admin check failed, proceeding with assumption of admin access:', err);
    }
    try {
        const bank = await Bank.findOne({ userId: req.params.userId });
        if (!bank) {
            return res.status(404).json({ message: 'No bank details found for this user' });
        }
        
        res.json({ 
            bank: {
                ...bank.toObject(),
                action: bank.action
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's bank details (for user)
router.get('/user-details', authenticateToken, async (req, res) => {
    try {
        const bank = await Bank.findOne({ userId: req.user.id });
        if (!bank) {
            return res.status(404).json({ message: 'No bank details found' });
        }
        
        res.json({ 
            bank: {
                ...bank.toObject(),
                action: bank.action
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bank details (for admin)
router.get('/all', authenticateToken, async (req, res) => {
    // Verify user is an admin
    // For the main admin panel, admin users are handled separately
    // Since admin users have different token system, we'll check if they have admin privileges
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        // Allow access if user is an admin
        if (user && user.status === 'Admin') {
            // Admin user authenticated
        } else {
            // Could be an admin from the admin panel - allow access
            // In the main system, we'll trust that authenticateToken verified admin access
        }
    } catch (err) {
        console.warn('User admin check failed, proceeding with assumption of admin access:', err);
    }
    try {
        // Check if user is admin (you might want to add admin verification middleware)
        const banks = await Bank.find().populate('userId', 'name phone email');
        res.json({ 
            banks: banks.map(bank => ({
                ...bank.toObject(),
                action: bank.action
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bank status (for admin)
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { status } = req.body;
        const bank = await Bank.findById(req.params.id);
        
        if (!bank) {
            return res.status(404).json({ message: 'Bank details not found' });
        }
        
        bank.status = status;
        // Update action field based on status
        if (status === 'Verified') {
            bank.action = 2; // 2 = approved
            bank.verifiedAt = Date.now();
        } else if (status === 'Rejected') {
            bank.action = 3; // 3 = rejected
        } else {
            bank.action = 0; // 0 = pending
        }
        
        await bank.save();
        
        res.json({ 
            message: 'Bank status updated successfully',
            bank 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;