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


// ─────────────────────────────────────────────────────────────────────────────
// ✅ TEST ROUTE — Manually trigger midnight reset (REMOVE AFTER TESTING)
// Browser mein open karo: https://your-server.com/api/test/trigger-midnight-reset
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/test/trigger-midnight-reset', async (req, res) => {
  try {
    console.log('🧪 MANUAL TEST: Midnight reset triggered manually...');

    const Quantify = require('./models/Quantify');
    const QuantifyHistory = require('./models/QuantifyHistory');

    // Step 1: Saare users ka quantify data fetch karo
    const allQuantifyData = await Quantify.find({});
    console.log(`📊 Total users found: ${allQuantifyData.length}`);

    if (allQuantifyData.length === 0) {
      return res.json({
        success: true,
        message: '⚠️ Koi bhi user quantify data nahi mila. Pehle kisi user ne Start Quantifying click karna chahiye.',
        usersReset: 0,
        historySaved: 0,
        details: []
      });
    }

    const now = new Date();
    const results = []; // Har user ka result track karne ke liye

    // Step 2: Har user ke liye loop chalao
    for (const quantifyData of allQuantifyData) {
      const userResult = {
        userId: quantifyData.userId,
        todayEarningBeforeReset: quantifyData.todayEarning,
        historySaved: false,
        resetDone: false,
        error: null
      };

      try {
        // Step 3: Agar aaj ki earning hai toh history save karo
        if (quantifyData.todayEarning > 0) {
          await QuantifyHistory.create({
            userId: quantifyData.userId,
            date: now,
            mode: quantifyData.mode,
            startingBalance: quantifyData.balance,
            startingTotalRevenue: quantifyData.totalRevenue - quantifyData.todayEarning,
            earning: quantifyData.todayEarning,
            endingTotalRevenue: quantifyData.totalRevenue,
            isQuantifyingActive: quantifyData.isQuantifying,
            hadDepositOrWithdrawal: false
          });
          userResult.historySaved = true;
          console.log(`✅ History saved for user: ${quantifyData.userId} | Earning: ${quantifyData.todayEarning}`);
        } else {
          console.log(`⚠️ No earning today for user: ${quantifyData.userId} — history skipped`);
        }

        // Step 4: Reset karo naye din ke liye
        quantifyData.todayEarning = 0;
        quantifyData.isQuantifying = false;
        quantifyData.mode = 'continue';
        quantifyData.lastResetDate = now;
        quantifyData.lastActivityDate = now;
        await quantifyData.save();

        userResult.resetDone = true;
        console.log(`🔄 Reset done for user: ${quantifyData.userId}`);

      } catch (userError) {
        userResult.error = userError.message;
        console.error(`❌ Error for user ${quantifyData.userId}:`, userError);
      }

      results.push(userResult);
    }

    // Step 5: Summary response bhejo
    const historySavedCount = results.filter(r => r.historySaved).length;
    const resetDoneCount = results.filter(r => r.resetDone).length;
    const errorCount = results.filter(r => r.error).length;

    console.log('✅ MANUAL TEST: Midnight reset completed!');
    console.log(`   History saved: ${historySavedCount}/${allQuantifyData.length}`);
    console.log(`   Reset done: ${resetDoneCount}/${allQuantifyData.length}`);
    console.log(`   Errors: ${errorCount}`);

    res.json({
      success: true,
      message: '✅ Manual midnight reset completed successfully!',
      summary: {
        totalUsers: allQuantifyData.length,
        historySaved: historySavedCount,
        resetDone: resetDoneCount,
        errors: errorCount
      },
      // Har user ka detail
      details: results
    });

  } catch (error) {
    console.error('❌ MANUAL TEST: Midnight reset failed:', error);
    res.status(500).json({
      success: false,
      message: '❌ Manual reset failed!',
      error: error.message
    });
  }
});
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️ UPAR WALA PURA app.get BLOCK TESTING KE BAAD HATA DENA
// ─────────────────────────────────────────────────────────────────────────────


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

// ✅ MIDNIGHT RESET CRON JOB
// Har raat 12:00 AM IST par automatically chalega — server side
// User ka browser open ho ya band ho, login ho ya na ho — reset ZAROOR hoga
cron.schedule('0 0 * * *', async () => {
  console.log('🌙 Cron Job: Midnight reset starting...');

  try {
    const Quantify = require('./models/Quantify');
    const QuantifyHistory = require('./models/QuantifyHistory');

    const allQuantifyData = await Quantify.find({});

    console.log(`📊 Total users to reset: ${allQuantifyData.length}`);

    const now = new Date();

    for (const quantifyData of allQuantifyData) {
      try {
        // History save karo agar aaj ki earning thi
        if (quantifyData.todayEarning > 0) {
          await QuantifyHistory.create({
            userId: quantifyData.userId,
            date: now,
            mode: quantifyData.mode,
            startingBalance: quantifyData.balance,
            startingTotalRevenue: quantifyData.totalRevenue - quantifyData.todayEarning,
            earning: quantifyData.todayEarning,
            endingTotalRevenue: quantifyData.totalRevenue,
            isQuantifyingActive: quantifyData.isQuantifying,
            hadDepositOrWithdrawal: false
          });
          console.log(`✅ History saved for user: ${quantifyData.userId}`);
        }

        // Reset karo naye din ke liye
        quantifyData.todayEarning = 0;
        quantifyData.isQuantifying = false;
        quantifyData.mode = 'continue';
        quantifyData.lastResetDate = now;
        quantifyData.lastActivityDate = now;
        await quantifyData.save();

        console.log(`🔄 Reset done for user: ${quantifyData.userId}`);

      } catch (userError) {
        console.error(`❌ Error resetting user ${quantifyData.userId}:`, userError);
      }
    }

    console.log('✅ Cron Job: Midnight reset completed for all users!');

  } catch (error) {
    console.error('❌ Cron Job: Midnight reset failed:', error);
  }

}, {
  timezone: "Asia/Kolkata" // ✅ Indian Standard Time
});

console.log('✅ Midnight reset cron job scheduled (runs at 12:00 AM IST daily)');

// ─────────────────────────────────────────────────────────────────────────────
// ✅ 404 HANDLER - Return JSON for undefined routes
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 404
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ✅ GLOBAL ERROR HANDLER - Always return JSON
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.message);
  console.error('Stack:', err.stack);
  
  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', err);
  }
  
  res.status(err.status || 500).json({
    error: err.name === 'ValidationError' ? 'Validation Error' : 'Internal Server Error',
    message: err.message || 'Something went wrong',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});