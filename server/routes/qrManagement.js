const express = require('express');
const QRCode = require('../models/QRCode');
const Admin = require('../models/Admin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
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

// GET all QR codes
router.get('/qrcodes', async (req, res) => {
    try {
        const qrCodes = await QRCode.find().populate('lastUpdatedBy', 'name username');
        res.json(qrCodes);
    } catch (err) {
        console.error('Error fetching QR codes:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET QR code image
router.get('/qrcodes/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/qrcodes', filename);
    
    if (fs.existsSync(imagePath)) {
      res.setHeader('Access-Control-Allow-Origin', '*');           // ✅ Line 1 add karo
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // ✅ Line 2 add karo
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (err) {
    console.error('Error serving image:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET specific QR code by payment method
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

// POST upload QR code image
router.post('/qrcodes/upload', upload.single('qrImage'), async (req, res) => {
    console.log('Upload route called');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);

    try {
        if (!req.file) {
            console.log('No file received');
            return res.status(400).json({ message: 'No image file provided' });
        }

        const { paymentMethod, upiId, accountName, accountNumber, ifscCode, adminId } = req.body;
        console.log('Received data:', { paymentMethod, upiId, adminId });

        // Validate required fields
        if (!paymentMethod) {
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Check if admin exists
        console.log('Looking for admin with ID:', adminId);
        if (!adminId) {
            console.log('No adminId provided');
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Admin ID is required' });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            console.log('Admin not found with ID:', adminId);
            // Delete uploaded file if admin not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Admin not found' });
        }
        console.log('Admin found:', admin.username);

        // Construct image URL
        const imageUrl = `/api/qr/qrcodes/image/${req.file.filename}`;

        // Update or create QR code
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
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            message: 'QR code uploaded successfully',
            qrCode: updatedQRCode
        });
    } catch (err) {
        console.error('Error uploading QR code:', err);
        console.error('Error stack:', err.stack);
        // Delete uploaded file if error occurs
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
                console.log('Deleted uploaded file due to error');
            } catch (deleteErr) {
                console.error('Error deleting file:', deleteErr);
            }
        }
        res.status(500).json({
            message: 'Server error',
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// POST update QR code (for base64 data)
router.post('/qrcodes/update', async (req, res) => {
    try {
        const {
            paymentMethod,
            qrImage,
            upiId,
            accountName,
            accountNumber,
            ifscCode,
            adminId
        } = req.body;

        // Validate required fields
        if (!paymentMethod || !qrImage) {
            return res.status(400).json({ message: 'Payment method and QR image are required' });
        }

        // Check if admin exists
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update or create QR code
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
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        res.json({
            message: 'QR code updated successfully',
            qrCode: updatedQRCode
        });
    } catch (err) {
        console.error('Error updating QR code:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST toggle QR code active status
router.post('/qrcodes/toggle-status', async (req, res) => {
    try {
        const { paymentMethod, adminId } = req.body;

        const qrCode = await QRCode.findOne({ paymentMethod });
        if (!qrCode) {
            return res.status(404).json({ message: 'QR code not found' });
        }

        // Check if admin exists
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        qrCode.isActive = !qrCode.isActive;
        qrCode.lastUpdatedBy = adminId;
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

// DELETE QR code
router.delete('/qrcodes/:paymentMethod', async (req, res) => {
    try {
        const { paymentMethod } = req.params;
        const { adminId } = req.body;

        // Check if admin exists
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

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