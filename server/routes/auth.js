const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Test endpoint to list users
router.get('/test-users', async (req, res) => {
  try {
    const users = await User.find({}, 'phone email name balance');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to create a test user
router.post('/create-test-user', async (req, res) => {
  try {
    const user = new User({
      phone: '1234567890',
      password: 'test123',
      name: 'Test User'
    });
    
    await user.save();
    res.json({ message: 'Test user created', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint to make a user admin
router.post('/make-admin/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.status = 'Admin';
    await user.save();
    
    res.json({ message: 'User made admin', userId: user._id, status: user.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Test endpoint to check user status
router.get('/user-status/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      userId: user._id, 
      phone: user.phone, 
      name: user.name, 
      status: user.status,
      balance: user.balance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

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

// GET USER DATA
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -transactionPassword');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// REGISTER
router.post('/register', async (req, res) => {
    try {
        // console.log('📝 Registration attempt:', req.body);
        
        const { phone, email, password, referralCode } = req.body;

        // Check if user already exists
        const query = phone ? { phone } : { email };
        let user = await User.findOne(query);

        if (user) {
            // console.log('❌ User already exists:', query);
            return res.status(400).json({ message: 'User already exists' });
        }

        // console.log('✅ User does not exist, creating new user...');

        // Generate unique name
        let uniqueName = '';
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 100) {
            if (phone) {
                // For phone registration: MEMBER_[last 4 digits]_[3 random letters]
                const lastFourDigits = phone.slice(-4);
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let randomLetters = '';
                for (let i = 0; i < 3; i++) {
                    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                uniqueName = `MEMBER_${lastFourDigits}_${randomLetters}`;
            } else {
                // For email registration, generate a unique MEMBER name
                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                let randomLetters = '';
                for (let i = 0; i < 3; i++) {
                    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
                }
                const randomNum = Math.floor(100 + Math.random() * 900);
                uniqueName = `MEMBER_${randomNum}_${randomLetters}`;
            }
            
            // Check if name is unique
            const existingUser = await User.findOne({ name: uniqueName });
            if (!existingUser) {
                isUnique = true;
            }
            attempts++;
        }

        user = new User({
            phone,
            email,
            password,
            name: uniqueName
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Prepare user response data
        const userResponse = {
            _id: user._id,
            phone: user.phone,
            email: user.email,
            name: user.name,
            balance: user.balance
        };
        
        // Add referral information if referral code was provided
        if (referralCode) {
            userResponse.referralCode = referralCode;
        }
        
        res.status(201).json({ 
            token, 
            message: 'Registration successful',
            user: userResponse
        });

    } catch (err) {
        console.error('❌ Registration error:', err);
        console.error('Error details:', err.message);
        console.error('Stack trace:', err.stack);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { phone, email, password } = req.body;

        const query = phone ? { phone } : { email };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            message: 'Login successful',
            user: { 
                _id: user._id,
                phone: user.phone, 
                email: user.email,
                name: user.name,
                balance: user.balance
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// CHANGE PASSWORD
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword; // Hashing is handled by UserSchema.pre('save')
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// CHANGE TRANSACTION PASSWORD
router.post('/change-transaction-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From token

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user's verified bank account
        const Bank = require('../models/Bank');
        let userBank = await Bank.findOne({ userId: userId, status: 'Verified' });
        
        if (!userBank) {
            // If no verified bank, check for any bank account
            userBank = await Bank.findOne({ userId: userId });
            if (!userBank) {
                return res.status(404).json({ message: 'No bank account found. Please add a bank account first.' });
            }
        }

        // Compare with current transaction password using bcrypt
        const isMatch = await userBank.compareTransactionPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current transaction password is incorrect' });
        }

        // Update transaction password in bank model
        userBank.transactionPassword = newPassword;
        await userBank.save();

        res.json({ message: 'Transaction password updated successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET USER WITHDRAWAL HISTORY
router.get('/:userId/withdrawals', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the requesting user is authorized to view these withdrawals
        if (req.user.id !== userId) {
            return res.status(403).json({ message: 'Unauthorized to view these withdrawals' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Filter withdrawal transactions and sort by newest first
        const withdrawals = user.transactions
            .filter(transaction => transaction.type === 'withdrawal')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => ({
                _id: transaction._id,
                amount: transaction.amount,
                status: transaction.status,
                date: transaction.date,
                bankAccount: user.bankDetails // Include bank details for display
            }));

        res.json(withdrawals);
    } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
