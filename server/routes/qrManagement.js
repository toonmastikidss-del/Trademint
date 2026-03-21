const express = require('express');
const QRCode = require('../models/QRCode');
const Admin = require('../models/Admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// ✅ Middleware — Token se admin verify karo, body me adminId ki zaroorat nahi
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ message: 'Admin account is deactivated' });
    }

    req.admin = admin; // ✅ Admin object attach kar diya
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/qrcodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'qr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// ✅ GET all QR codes — public (frontend ke liye)
router.get('/qrcodes', async (req, res) => {
  try {
    const qrCodes = await QRCode.find().populate('lastUpdatedBy', 'name username');
    res.json(qrCodes);
  } catch (err) {
    console.error('Error fetching QR codes:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET QR code image — CORS headers ke saath
router.get('/qrcodes/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/qrcodes', filename);

    if (fs.existsSync(imagePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
    console.error('Error serving image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET specific QR code by payment method
router.get('/qrcodes/:paymentMethod', async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const qrCode = await QRCode.findOne({ paymentMethod });

    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json(qrCode);
  } catch (err) {
    console.error('Error fetching QR code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST upload QR code — verifyAdmin middleware, adminId body me nahi chahiye ab
router.post('/qrcodes/upload', verifyAdmin, upload.single('qrImage'), async (req, res) => {
  // console.log('Upload route called, admin:', req.admin?.username);

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { paymentMethod, upiId, accountName, accountNumber, ifscCode } = req.body;

    if (!paymentMethod) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const adminId = req.admin._id; // ✅ Token se liya
    const imageUrl = `/api/qr/qrcodes/image/${req.file.filename}`;

    const updatedQRCode = await QRCode.findOneAndUpdate(
      { paymentMethod },
      {
        qrImage: imageUrl,
        upiId: upiId || '',
        accountName: accountName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        lastUpdatedBy: adminId,
        lastUpdated: new Date(),
        isActive: true
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'QR code uploaded successfully', qrCode: updatedQRCode });
  } catch (err) {
    console.error('Error uploading QR code:', err);
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ POST update QR code — verifyAdmin middleware
router.post('/qrcodes/update', verifyAdmin, async (req, res) => {
  try {
    const { paymentMethod, qrImage, upiId, accountName, accountNumber, ifscCode } = req.body;

    if (!paymentMethod || !qrImage) {
      return res.status(400).json({ message: 'Payment method and QR image are required' });
    }

    const adminId = req.admin._id; // ✅ Token se liya

    const updatedQRCode = await QRCode.findOneAndUpdate(
      { paymentMethod },
      {
        qrImage,
        upiId: upiId || '',
        accountName: accountName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        lastUpdatedBy: adminId,
        lastUpdated: new Date(),
        isActive: true
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'QR code updated successfully', qrCode: updatedQRCode });
  } catch (err) {
    console.error('Error updating QR code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ POST toggle QR code active status — verifyAdmin middleware
router.post('/qrcodes/toggle-status', verifyAdmin, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const qrCode = await QRCode.findOne({ paymentMethod });
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    qrCode.isActive = !qrCode.isActive;
    qrCode.lastUpdatedBy = req.admin._id; // ✅ Token se liya
    qrCode.lastUpdated = new Date();
    await qrCode.save();

    res.json({
      message: `QR code ${qrCode.isActive ? 'activated' : 'deactivated'} successfully`,
      qrCode
    });
  } catch (err) {
    console.error('Error toggling QR code status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE QR code — verifyAdmin middleware
router.delete('/qrcodes/:paymentMethod', verifyAdmin, async (req, res) => {
  try {
    const { paymentMethod } = req.params;

    const deletedQRCode = await QRCode.findOneAndDelete({ paymentMethod });
    if (!deletedQRCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    res.json({ message: 'QR code deleted successfully', qrCode: deletedQRCode });
  } catch (err) {
    console.error('Error deleting QR code:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;