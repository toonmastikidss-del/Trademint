                                                             const express = require('express');
const User = require('../models/User');
const Deposit = require('../models/Deposit'); // Import Deposit model to get deposit records
const router = express.Router();

// GET all users for admin panel
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password -transactionPassword').sort({ createdAt: -1 });
        
        // Format users data for admin panel
        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name || `User_${user._id.toString().slice(-6)}`,
            phone: user.phone,
            email: user.email,
            uid: user.phone ? user.phone.slice(-6) : user.email ? Math.abs(user.email.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString().slice(-6) : '000000',
            balance: user.balance || 0,
            status: user.status || 'Active',
            lastActive: user.lastActive || user.updatedAt || new Date(),
            createdAt: user.createdAt,
            bankDetails: user.bankDetails || null,
            transactions: user.transactions || []
        }));

        res.json(formattedUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST user action (block/suspend/unsuspend)
router.post('/user-action', async (req, res) => {
    try {
        const { userId, action } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user status based on action
        switch (action) {
            case 'block':
                user.status = 'Blocked';
                break;
            case 'suspend':
                user.status = 'Suspended';
                break;
            case 'unsuspend':
                user.status = 'Active';
                break;
            default:
                return res.status(400).json({ message: 'Invalid action' });
        }

        user.lastActive = new Date();
        await user.save();

        res.json({ message: `User ${action}ed successfully`, user });
    } catch (err) {
        console.error('Error performing user action:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST deposit funds to user account
router.post('/deposit', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Update user balance
        user.balance = (user.balance || 0) + depositAmount;
        
        // Add transaction record
        if (!user.transactions) user.transactions = [];
        user.transactions.push({
            type: 'deposit',
            amount: depositAmount,
            date: new Date(),
            status: 'Completed'
        });

        user.lastActive = new Date();
        await user.save();

        res.json({ 
            message: 'Deposit processed successfully', 
            newBalance: user.balance,
            user 
        });
    } catch (err) {
        console.error('Error processing deposit:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST withdraw funds from user account
router.post('/withdrawal', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const withdrawalAmount = parseFloat(amount);
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Check if user has sufficient balance
        const currentBalance = user.balance || 0;
        if (withdrawalAmount > currentBalance) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Update user balance
        user.balance = currentBalance - withdrawalAmount;
        
        // Add transaction record
        if (!user.transactions) user.transactions = [];
        user.transactions.push({
            type: 'withdrawal',
            amount: withdrawalAmount,
            date: new Date(),
            status: 'Completed'
        });

        user.lastActive = new Date();
        await user.save();

        res.json({ 
            message: 'Withdrawal processed successfully', 
            newBalance: user.balance,
            user 
        });
    } catch (err) {
        console.error('Error processing withdrawal:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET user's complete transaction history (both user transactions and deposit records)
router.get('/user-transactions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user details
        const user = await User.findById(userId, '-password -transactionPassword');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's deposit records from the Deposit model
        const depositRecords = await Deposit.find({ userId: user._id }).sort({ timestamp: -1 });

        // Combine user's transaction history with deposit records
        const userTransactions = user.transactions || [];
        const combinedTransactions = [];

        // Add user's direct transactions (deposits/withdrawals by admin)
        userTransactions.forEach(transaction => {
            combinedTransactions.push({
                type: transaction.type,
                amount: transaction.amount,
                date: transaction.date || transaction.createdAt,
                status: transaction.status || 'Completed',
                source: 'admin_action' // Distinguish from deposit records
            });
        });

        // Add deposit records (UTR submissions)
        depositRecords.forEach(deposit => {
            combinedTransactions.push({
                type: 'deposit', // Deposit via UTR submission
                amount: deposit.amount,
                date: deposit.timestamp,
                status: deposit.status || 'Pending',
                utrNumber: deposit.utrNumber,
                source: 'deposit_submission' // Distinguish from admin actions
            });
        });

        // Sort all transactions by date (newest first)
        combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                balance: user.balance
            },
            transactions: combinedTransactions
        });
    } catch (err) {
        console.error('Error fetching user transaction history:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;