const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Personal Details
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  emailAddress: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pinCode: {
    type: String,
    required: true,
    match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit PIN code']
  },
  
  // Document Details
  aadharNumber: {
    type: String,
    required: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  panNumber: {
    type: String,
    required: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  
  // Document Images (stored as base64 strings after compression)
  aadharFrontImage: {
    type: String, // Base64 compressed image
    required: true
  },
  aadharBackImage: {
    type: String, // Base64 compressed image
    required: true
  },
  panCardImage: {
    type: String, // Base64 compressed image
    required: true
  },
  bankPassbookImage: {
    type: String, // Base64 compressed image
    required: true
  },
  userPhoto: {
    type: String, // Base64 compressed image
    required: true
  },
  
  // Bank Details
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  ifscCode: {
    type: String,
    required: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
  },
  branchName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KYC', kycSchema);