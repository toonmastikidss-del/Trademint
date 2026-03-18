const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: String, // 'user' or 'admin'
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ChatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userPhone: String,
    messages: [MessageSchema],
    status: {
        type: String,
        enum: ['automated', 'active', 'closed'],
        default: 'automated'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', ChatSchema);
