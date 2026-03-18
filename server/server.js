const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const Admin = require('./models/Admin');
const QRCode = require('./models/QRCode');
const KYC = require('./models/KYC');

dotenv.config();

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_change_this_in_production') {
  console.warn('⚠️  WARNING: JWT_SECRET is using default value. Change this in production!');
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:5173', 'https://trademint.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security Headers
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for React apps
    crossOriginEmbedderPolicy: false,
  }));
}

// Rate Limiting - Prevent API abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limit for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/admin/auth/login', authLimiter);

app.use(express.json());
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/auth', require('./routes/adminAuth'));
app.use('/api/bank', require('./routes/bank'));
app.use('/api/deposit', require('./routes/deposit'));
app.use('/api/quantify', require('./routes/quantify'));
app.use('/api/qr', require('./routes/qrManagement'));
app.use('/api/withdrawal', require('./routes/withdrawal'));
app.use('/api/task', require('./routes/task'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/game', require('./routes/game'));


// Create initial admin user
const createInitialAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: '7027019576' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Qwmusty%%@!FFSms', salt);
      
      const admin = new Admin({
        username: '7027019576',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'superadmin'
      });
      
      await admin.save();
      console.log('✅ Initial admin user created successfully');
      // console.log('Username: 7027019576');
      // console.log('Password: Qwmusty%%@!FFSms');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating initial admin:', err);
  }
};

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
  socketTimeoutMS: 45000, // Socket timeout
})
    .then(async () => {
      console.log('✅ MongoDB Connected Successfully');
      // Create initial admin after DB connection
      await createInitialAdmin();
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('Please check your MONGO_URI environment variable and network connection');
      process.exit(1); // Exit if database connection fails
    });

// Serve static files from React app in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));
  
//   // Handle React routing, return all requests to React app
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
//   });
// }

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));