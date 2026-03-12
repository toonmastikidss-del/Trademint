const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');

// Common problems and automated answers
const FAQ = {
    'deposit': 'To deposit money, go to the Home page, click on the Deposit icon, and follow the instructions. Usually it takes 5-10 minutes to reflect.',
    'withdraw': 'Withdrawals are processed within 24 hours. Make sure you have bound your bank account correctly in the "Bind Card" section.',
    'account': 'If you are facing login issues, try resetting your password or contact our support team directly.',
    'bonus': 'Referral bonuses are credited automatically when your friend completes their first quantification.'
};

// Start or continue chat
router.post('/message', async (req, res) => {
    try {
        const { userId, text, isAutomated = false } = req.body;
        const user = await User.findById(userId);
        
        let chat = await Chat.findOne({ userId, status: { $ne: 'closed' } });
        
        if (!chat) {
            chat = new Chat({ 
                userId, 
                userPhone: user ? user.phone : 'Unknown',
                messages: [] 
            });
        }

        chat.messages.push({ sender: 'user', text });
        chat.lastMessageAt = Date.now();

        // If it's a known FAQ, provide automated response
        if (isAutomated && FAQ[text.toLowerCase()]) {
            chat.messages.push({ sender: 'admin', text: FAQ[text.toLowerCase()] });
        } else if (!isAutomated) {
            // If user specifically types something or clicks "Talk to Admin"
            chat.status = 'active';
        }

        await chat.save();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's chat history
router.get('/history/:userId', async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.params.userId, status: { $ne: 'closed' } });
        res.json(chat || { messages: [] });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all active chats
router.get('/admin/active', async (req, res) => {
    try {
        const chats = await Chat.find({ status: 'active' }).sort({ lastMessageAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Reply to chat
router.post('/admin/reply', async (req, res) => {
    try {
        const { chatId, text } = req.body;
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        chat.messages.push({ sender: 'admin', text });
        chat.lastMessageAt = Date.now();
        await chat.save();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
