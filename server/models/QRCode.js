const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    required: true,
    enum: ['General', 'UPI', 'Umoney', 'Super', 'Cloudspay'],
    default: 'General'
  },
  qrImage: {
    type: String,
    required: true
  },
  upiId: {
    type: String,
    default: ''
  },
  accountName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  ifscCode: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QRCode', qrCodeSchema);