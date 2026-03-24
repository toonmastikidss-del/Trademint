const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron'); // ✅ ADDED

// ════════════════════════════════════════════════════════════
//  🔧 TEMPORARY WAKE-UP CONFIGURATION
//  Render free tier sleep mode se bachne ke liye
//  Disable karne ke liye: ENABLE_WAKEUP_PING = false karo
// ════════════════════════════════════════════════════════════
const ENABLE_WAKEUP_PING = true; // ← Set to false to disable wake-up ping
const WAKEUP_TIME_IST = '52 23 * * *'; // 11:52 PM IST daily (8 min before midnight reset)

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
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (err) {
    console.error('Error creating initial admin:', err);
  }
};

// Connect to MongoDB with proper error handling
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
    .then(async () => {
      console.log('✅ MongoDB Connected Successfully');
      await createInitialAdmin();
    })
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('Please check your MONGO_URI environment variable and network connection');
      process.exit(1);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ── Helper: IST date string ────────────────────────────────
const toISTDateString = (date) =>
  new Date(date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });

// ── The actual reset function ───────────────────────────────
const runMidnightResetForAllUsers = async () => {
  console.log('🕛 CRON START: Midnight reset running at', new Date().toISOString());

  try {
    // Import models inside the function to avoid circular dependencies
    const Quantify        = require('./models/Quantify');
    const QuantifyHistory = require('./models/QuantifyHistory');
    const User            = require('./models/User');
    
    // Sabhi active quantify records fetch karo
    const allQuantifyDocs = await Quantify.find({});

    if (allQuantifyDocs.length === 0) {
      console.log('ℹ️  CRON: No quantify records found. Skipping.');
      return;
    }

    let resetCount   = 0;
    let skippedCount = 0;
    const now        = new Date();

    for (const quantifyData of allQuantifyDocs) {
      try {
        const userId = quantifyData.userId;

        // ── Duplicate reset guard ────────────────────────────
        // Agar aaj already reset ho chuka hai toh skip karo
        const lastResetIST = quantifyData.lastResetDate
          ? toISTDateString(quantifyData.lastResetDate)
          : null;
        const todayIST = toISTDateString(now);

        if (lastResetIST === todayIST) {
          console.log(`⏭️  CRON: User ${userId} already reset today. Skipping.`);
          skippedCount++;
          continue;
        }

        // ── History save karo (agar earning thi) ─────────────
        if (quantifyData.totalRevenue > 0 && quantifyData.todayEarning > 0) {
          await QuantifyHistory.create({
            userId,
            date                  : now,
            mode                  : quantifyData.mode,
            startingBalance       : quantifyData.balance,
            startingTotalRevenue  : quantifyData.totalRevenue - quantifyData.todayEarning,
            earning               : quantifyData.todayEarning,
            endingTotalRevenue    : quantifyData.totalRevenue,
            isQuantifyingActive   : quantifyData.isQuantifying,
            hadDepositOrWithdrawal: false
          });
        }

        // ── User ka quantify column update karo ──────────────
        // (optional — agar user model mein quantify field hai)
        await User.findByIdAndUpdate(userId, {
          quantify: quantifyData.totalRevenue
        });

        // ── Reset for new day ────────────────────────────────
        quantifyData.mode          = 'continue';
        quantifyData.todayEarning  = 0;
        quantifyData.isQuantifying = false;
        quantifyData.lastResetDate = now;
        // NOTE: lastActivityDate intentionally NOT updated here
        //       (same fix jaise routes/quantify.js mein hai)
        await quantifyData.save();

        resetCount++;
        console.log(`✅ CRON: Reset done for user ${userId}`);

      } catch (userErr) {
        // Ek user fail hone se baaki users affect na ho
        console.error(`❌ CRON: Error resetting user ${quantifyData.userId}:`, userErr.message);
      }
    }

    console.log(`✅ CRON DONE: Reset=${resetCount}, Skipped(already done)=${skippedCount}, Total=${allQuantifyDocs.length}`);

  } catch (err) {
    console.error('❌ CRON FATAL ERROR:', err);
  }
};

// ── Schedule the cron ────────────────────────────────────────
//
//  🔴 IMPORTANT — timezone choose karo:
//
//  Option A: Server UTC pe hai (most VPS/cloud servers)
//    IST midnight = UTC 18:30  →  '30 18 * * *'
//
//  Option B: Server IST pe set hai (Indian hosting like Hostinger India)
//    →  '0 0 * * *'
//
//  Verify karo: server pe `date` command chalao
//    UTC dikhaye  →  Option A
//    IST dikhaye  →  Option B
//
//  node-cron timezone support bhi hai (v3+):
//    { scheduled: true, timezone: "Asia/Kolkata" }
//    Isse cron automatically IST mein chalega chahe server kahi bhi ho ✅

cron.schedule(
  '0 0 * * *',                    // ← har roz midnight
  runMidnightResetForAllUsers,
  {
    scheduled : true,
    timezone  : 'Asia/Kolkata'    // ← IST midnight — server timezone se independent ✅
  }
);

console.log('✅ Cron job scheduled: Midnight reset at 12:00 AM IST daily');

// ════════════════════════════════════════════════════════════
//  🛠️ WAKE-UP PING - Render sleep mode se bachao
//  Har raat 11:52 PM IST pe server ko wake up karega
//  Disable: ENABLE_WAKEUP_PING = false
// ════════════════════════════════════════════════════════════
if (ENABLE_WAKEUP_PING) {
  const axios = require('axios');
  
  cron.schedule(
    WAKEUP_TIME_IST, // 11:52 PM IST
    async () => {
      try {
        console.log('⏰ WAKE-UP PING: Server ko wake up kar raha hai...');
        
        // Apne backend URL ko hit karo (health check endpoint)
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        
        await axios.get(`${backendUrl}/api/auth/health`, {
          timeout: 5000 // 5 seconds timeout
        });
        
        console.log('✅ WAKE-UP PING: Server awake! Cron job ready for midnight reset.');
        
      } catch (error) {
        // Error aaye toh bhi server wake up ho jayega
        console.log('⚠️ WAKE-UP PING: Health check failed, but server should still wake up:', error.message);
        
        // Alternative: Simple ping to any endpoint
        try {
          await axios.get(`${backendUrl}/`, { timeout: 3000 });
          console.log('✅ WAKE-UP PING: Alternative ping successful');
        } catch (altError) {
          console.error('❌ WAKE-UP PING: Alternative ping bhi failed:', altError.message);
        }
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata'
    }
  );
  
  console.log('✅ Wake-up ping scheduled: 11:52 PM IST daily (keeps server awake for midnight cron)');
}
// ═══════════════════════════════════════════════════════════=