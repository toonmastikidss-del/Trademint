const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated' 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Ensure there's a corresponding user in the User collection
    let user = await User.findOne({ phone: admin.username });
    if (!user) {
      // Create a user for this admin
      user = new User({
        phone: admin.username,
        password: password, // Use the same password
        name: admin.name || admin.username,
        status: 'Admin'
      });
      await user.save();
    } else if (user.status !== 'Admin') {
      // Make sure existing user has admin status
      user.status = 'Admin';
      await user.save();
    }

    // Generate JWT token using the user's ID
    const token = jwt.sign(
      { 
        id: user._id,
        username: admin.username,
        role: admin.role 
      },
      process.env.JWT_SECRET || 'admin_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
    const admin = await Admin.findById(decoded.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Create initial admin (for setup)
router.post('/setup', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const admin = new Admin({
      username,
      password: hashedPassword,
      name,
      role: 'superadmin'
    });

    await admin.save();

    res.status(201).json({ 
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (err) {
    console.error('Admin setup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;