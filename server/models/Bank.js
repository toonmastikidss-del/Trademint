const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BankSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountHolder: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    confirmAccountNumber: {
        type: String,
        required: true
    },
    ifsc: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    transactionPassword: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    action: {
        type: Number,
        default: 0, // 0 = pending, 2 = approved, 3 = rejected
        enum: [0, 2, 3]
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: {
        type: Date
    }
});

// Hash transaction password before saving
BankSchema.pre('save', async function(next) {
    if (!this.isModified('transactionPassword')) return next();
    // Don't hash if it's already hashed (check by looking at length/format)
    if (this.transactionPassword && this.transactionPassword.length < 60) {
        const salt = await bcrypt.genSalt(10);
        this.transactionPassword = await bcrypt.hash(this.transactionPassword, salt);
    }
    next();
});

// Method to compare transaction password
BankSchema.methods.compareTransactionPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.transactionPassword);
};

module.exports = mongoose.model('Bank', BankSchema);