const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        unique: true,
        sparse: true // Allows multiple users with no phone if they use email
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    transactionPassword: {
        type: String,
        default: '123456' // Default transaction password
    },
    name: {
        type: String,
        default: ''
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    balance: {
        type: Number,
        default: 0
    },
    quantify: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Blocked', 'Admin', 'Agent'],
        default: 'Active'
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin'],
        default: 'user'
    },
    agentDetails: {
        becameAgentAt: Date,
        agentLevel: {
            type: Number,
            default: 1
        },
        totalCommission: {
            type: Number,
            default: 0
        },
        commissionRate: {
            type: Number,
            default: 0.10 // 10% default, agents get 20%
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    bankDetails: {
        accountHolder: String,
        accountNumber: String,
        ifsc: String,
        bankName: String
    },
    transactions: [{
        type: {
            type: String,
            enum: ['deposit', 'withdrawal']
        },
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Completed'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};



module.exports = mongoose.model('User', UserSchema);
