const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  // Store all user financial data at time of request
  userFinancialData: {
    totalBalance: {
      type: Number,
      required: true
    },
    availableBalance: {
      type: Number,
      required: true
    },
    approvedDepositAmount: {
      type: Number,
      required: true
    }
  },
  bankAccount: {
    accountHolder: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    ifsc: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: false  // Made optional to prevent validation errors
    }
  },
  // Handling fee information
  handlingFee: {
    percentage: {
      type: Number,
      default: 4 // 4% fee
    },
    amount: {
      type: Number,
      required: true
    },
    actualReceipt: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  action: {
    type: Number,
    default: 0 // 0=pending, 1=approved, 2=rejected
  },
  // Admin action details
  processedBy: {
    adminId: String,
    adminName: String,
    processedAt: Date
  },
  // User history tracking
  userHistory: {
    totalWithdrawalRequests: {
      type: Number,
      default: 1
    },
    approvedRequests: {
      type: Number,
      default: 0
    },
    rejectedRequests: {
      type: Number,
      default: 0
    },
    lastWithdrawalRequest: {
      type: Date,
      default: Date.now
    }
  },
  // Additional user details for admin panel
  userDetails: {
    lastLoginDate: {
      type: Date,
      default: Date.now
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    totalWithdrawalRequests: {
      type: Number,
      default: 1
    },
    totalApprovedRequests: {
      type: Number,
      default: 0
    },
    totalRejectedRequests: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps before saving
withdrawalRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);