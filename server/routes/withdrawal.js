const express = require('express');
const router = express.Router();
const WithdrawalRequest = require('../models/WithdrawalRequest');
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

// Create withdrawal request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { amount, password, bankAccountId } = req.body;
    
    // Validate input
    if (!amount || amount < 100) {
      return res.status(400).json({ 
        error: 'Minimum withdrawal amount is ₹100' 
      });
    }
    
    if (!password) {
      return res.status(400).json({ 
        error: 'Security password is required' 
      });
    }
    
    // Fetch user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch user's verified bank account to get transaction password
    const Bank = require('../models/Bank');
    const userBank = await Bank.findOne({ userId: user._id, status: 'Verified' });
    
    if (!userBank) {
      return res.status(400).json({ 
        error: 'No verified bank account found. Please add and verify a bank account first.' 
      });
    }
    
    // Verify transaction password from bank model using bcrypt comparison
    const isPasswordValid = await userBank.compareTransactionPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid security password' 
      });
    }
    
    // Fetch KYC status directly from DB
    let kycApproved = false;
    try {
      const KYC = require('../models/KYC');
      const kycRecord = await KYC.findOne({ userId: user._id });
      kycApproved = kycRecord?.status === 'Approved';
    } catch (kycErr) {
      // console.error('Error fetching KYC status from DB:', kycErr);
      kycApproved = false;
    }
    
    // Calculate days since registration
    const userJoinDate = new Date(user.createdAt);
    const currentDate = new Date();
    const daysSinceRegistration = Math.floor((currentDate - userJoinDate) / (1000 * 60 * 60 * 24));
    
    // Fetch deposits directly from DB
    let approvedAmount = 0;
    try {
      const Deposit = require('../models/Deposit');
      const deposits = await Deposit.find({ userId: user._id, status: 'approved' });
      approvedAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
    } catch (depErr) {
      // console.error('Error fetching deposits from DB:', depErr);
      approvedAmount = 0;
    }
    
    // ── TWO WALLET SYSTEM ────────────────────────────────────────────────
    // mainBalance   = user.balance   (deposit wallet)
    // compoundBalance = user.quantify (compound wallet = main + earnings)
    // earnings      = compoundBalance - mainBalance
    //
    // Rule:
    //   1. Pehle earnings se kato
    //   2. Agar amount > earnings, bacha hua main se kato
    //   3. Compound always = new mainBalance (no pending earnings after withdrawal)
    // ────────────────────────────────────────────────────────────────────
    const mainBalance     = user.balance;
    const compoundBalance = user.quantify || 0;
    const earnings        = Math.max(0, compoundBalance - mainBalance);
    const totalWithdrawable = compoundBalance; // max user can withdraw

    // KYC / days-based restriction check
    let maxWithdrawalAmount = totalWithdrawable;
    
    if (!kycApproved || daysSinceRegistration < 14) {
      // Without KYC or before 14 days: can only withdraw earnings
      maxWithdrawalAmount = earnings;
      
      if (amount > maxWithdrawalAmount) {
        let errorMsg = `Without KYC completion and before 14 days, you can only withdraw ₹${maxWithdrawalAmount.toFixed(2)} (your compound earnings).`;
        
        if (!kycApproved && daysSinceRegistration < 14) {
          errorMsg += ' Complete KYC and wait 14 days to withdraw from Main Balance.';
        } else if (!kycApproved) {
          errorMsg += ' Complete KYC to withdraw more.';
        } else {
          errorMsg += ' Wait until day 14 to withdraw from Main Balance.';
        }
        
        return res.status(400).json({ error: errorMsg });
      }
    } else if (kycApproved && daysSinceRegistration >= 14) {
      // After KYC + 14 days: 50% of main + all earnings
      const fiftyPercentOfMain = mainBalance * 0.50;
      maxWithdrawalAmount = fiftyPercentOfMain + earnings;
      
      if (amount > maxWithdrawalAmount) {
        return res.status(400).json({ 
          error: `After KYC and 14 days, you can withdraw up to 50% of Main Balance plus all compound earnings. Maximum allowed: ₹${maxWithdrawalAmount.toFixed(2)} (50% of Main: ₹${fiftyPercentOfMain.toFixed(2)} + Compound Earnings: ₹${earnings.toFixed(2)}).` 
        });
      }
    }
    
    // Final safety check
    if (amount > totalWithdrawable) {
      return res.status(400).json({ 
        error: `Insufficient balance. Maximum withdrawable: ₹${totalWithdrawable.toFixed(2)}` 
      });
    }
    
    // Calculate handling fee (4%)
    const feeAmount    = amount * 0.04;
    const actualReceipt = amount - feeAmount;
    
    // Get user's withdrawal history
    const existingRequests  = await WithdrawalRequest.find({ userId: user._id });
    const totalRequests     = existingRequests.length + 1;
    const approvedRequests  = existingRequests.filter(r => r.status === 'approved').length;
    const rejectedRequests  = existingRequests.filter(r => r.status === 'rejected').length;
    
    // Create withdrawal request document
    const withdrawalRequest = new WithdrawalRequest({
      userId: user._id,
      userName: user.name,
      userPhone: user.phone,
      amount: amount,
      userFinancialData: {
        totalBalance: compoundBalance,
        availableBalance: mainBalance,
        approvedDepositAmount: approvedAmount
      },
      bankAccount: {
        accountHolder: userBank.accountHolder,
        accountNumber: userBank.accountNumber,
        ifsc: userBank.ifsc,
        bankName: userBank.bankName || 'Default Bank'
      },
      handlingFee: {
        percentage: 4,
        amount: feeAmount,
        actualReceipt: actualReceipt
      },
      userHistory: {
        totalWithdrawalRequests: totalRequests,
        approvedRequests: approvedRequests,
        rejectedRequests: rejectedRequests,
        lastWithdrawalRequest: new Date()
      },
      userDetails: {
        lastLoginDate: user.lastActive,
        registrationDate: user.createdAt,
        totalWithdrawalRequests: totalRequests,
        totalApprovedRequests: approvedRequests,
        totalRejectedRequests: rejectedRequests
      }
    });
    
    // ── DEDUCTION LOGIC (Two Wallet System) ─────────────────────────────
    // console.log('=== WITHDRAWAL DEDUCTION START ===');
    // console.log('Withdrawal Amount:', amount);
    // console.log('Before Deduction - Main Balance:', mainBalance);
    // console.log('Before Deduction - Compound Balance:', compoundBalance);
    // console.log('Earnings:', earnings);
    
    if (amount <= earnings) {
      // Case A: deduct only from compound (earnings side)
      user.quantify = compoundBalance - amount;
      // user.balance stays unchanged
      // console.log('Case A: Deducting from earnings only');
      // console.log('  user.balance unchanged:', user.balance);
      // console.log('  user.quantify:', compoundBalance, '-', amount, '=', user.quantify);

    } else {
      // Case B: exhaust all earnings first, then deduct rest from main
      const remainingAfterEarnings = amount - earnings;
      user.balance  = mainBalance - remainingAfterEarnings;
      user.quantify = user.balance; // compound resets to new main (0 earnings left)
      // console.log('Case B: Exhausted earnings, deducting from main');
      // console.log('  remainingAfterEarnings:', remainingAfterEarnings);
      // console.log('  user.balance:', mainBalance, '-', remainingAfterEarnings, '=', user.balance);
      // console.log('  user.quantify reset to:', user.quantify);
    }

    // console.log('After Deduction - Main Balance:', user.balance);
    // console.log('After Deduction - Compound Balance:', user.quantify);
    // console.log('=== WITHDRAWAL DEDUCTION END ===');

    // Sync quantify model if it exists
    const Quantify = require('../models/Quantify');
    let quantifyData = await Quantify.findOne({ userId: user._id });
    
    if (quantifyData) {
      // ── FIX: Update quantify data WITHOUT recalculating earnings ──────────
      // Pehle deduction ho chuka hai (upar), ab sirf sync karna hai
      // Earnings recalculate MAT karo, warna deduction undo ho jayega!
      
      quantifyData.mode            = 'current';
      quantifyData.balance         = user.balance;
      quantifyData.totalRevenue    = user.quantify;  // Use already-deducted value
      quantifyData.todayEarning    = 0;
      quantifyData.lastActivityDate = new Date();
      quantifyData.isQuantifying   = false;  // Reset quantifying on withdrawal
      
      // console.log('✅ Quantify data synced:', {
      //   balance: quantifyData.balance,
      //   totalRevenue: quantifyData.totalRevenue,
      //   todayEarning: quantifyData.todayEarning,
      //   isQuantifying: quantifyData.isQuantifying
      // });
      
      await quantifyData.save();
    }

    await withdrawalRequest.save();
    await user.save();
    
    // console.log('✅ User saved with - balance:', user.balance, ', quantify:', user.quantify);
    
    res.json({ 
      message: 'Withdrawal request submitted successfully',
      requestId: withdrawalRequest._id,
      amount: amount,
      fee: feeAmount,
      actualReceipt: actualReceipt,
      status: 'pending'
    });
    
  } catch (error) {
    // console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's withdrawal requests
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized to view these requests' });
    }
    
    const requests = await WithdrawalRequest.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    // console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all withdrawal requests (for admin)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Try to find user by the token ID (could be admin._id or user._id)
    let user = await User.findById(req.user.id);
    
    // If not found, try to find by phone (admin username) and check if Admin
    if (!user && req.user.username) {
      user = await User.findOne({ phone: req.user.username, status: 'Admin' });
    }
    
    if (!user || user.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const requests = await WithdrawalRequest.find()
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update withdrawal request status (for admin)
router.put('/status/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    // Try to find admin user by the token ID (could be admin._id or user._id)
    let adminUser = await User.findById(req.user.id);
    
    // If not found, try to find by phone (admin username) and check if Admin
    if (!adminUser && req.user.username) {
      adminUser = await User.findOne({ phone: req.user.username, status: 'Admin' });
    }
    
    if (!adminUser || adminUser.status !== 'Admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const request = await WithdrawalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Withdrawal request not found' });
    }
    
    if (action === 1) {
      request.status = 'approved';
      request.action = 1;
      
      // Approved: amount already deducted at request time, nothing to do
      const userToUpdate = await User.findById(request.userId);
      if (userToUpdate) {
        await userToUpdate.save();
      }

    } else if (action === 2) {
      request.status = 'rejected';
      request.action = 2;
      
      // Rejected: restore the amount back using two-wallet logic
      const userToUpdate = await User.findById(request.userId);
      if (userToUpdate) {
        // ── RESTORE LOGIC ──────────────────────────────────────────────
        // We simply reverse what was deducted.
        // The safest approach: add amount back to both balance and quantify
        // proportionally. Since we don't store which wallet was used,
        // we restore to compound first (safer — doesn't over-inflate main).
        //
        // Simple rule on rejection:
        //   compound += amount  (always safe)
        //   if compound was already > main before, keep main as-is
        //   if main was reduced, restore main too
        //
        // Simplest safe restore: add back to quantify (compound).
        // If main was also reduced (Case B), we restore main too.
        // We detect Case B: at request time, mainBalance was stored in userFinancialData.
        // ───────────────────────────────────────────────────────────────
        const requestedAmount    = request.amount;
        const mainAtRequestTime  = request.userFinancialData?.availableBalance || userToUpdate.balance;
        const currentMain        = userToUpdate.balance;

        // If main was reduced (currentMain < mainAtRequestTime), restore it
        if (currentMain < mainAtRequestTime) {
          userToUpdate.balance = mainAtRequestTime; // restore main
        }

        // Always restore compound
        userToUpdate.quantify = (userToUpdate.quantify || 0) + requestedAmount;

        await userToUpdate.save();
      }

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    request.processedBy = {
      adminId: adminUser._id,
      adminName: adminUser.name,
      processedAt: new Date()
    };
    
    await request.save();
    
    res.json({ 
      message: `Withdrawal request ${action === 1 ? 'approved' : 'rejected'} successfully`,
      request 
    });
  } catch (error) {
    // console.error('Error updating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all withdrawals (Admin only - JWT_ADMIN_SECRET route)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const adminToken = req.headers.authorization?.split(' ')[1];
    if (!adminToken) {
      return res.status(401).json({ error: 'Token required' });
    }
    
    const decoded = jwt.verify(adminToken, process.env.JWT_ADMIN_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const withdrawals = await WithdrawalRequest.find().sort({ createdAt: -1 }).populate('userId', 'name phone email');
    res.json(withdrawals);
  } catch (error) {
    // console.error('Error fetching all withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

module.exports = router;