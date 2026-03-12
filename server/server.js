const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');
const fileUpload = require('express-fileupload');

// Models
const Admin = require('./models/Admin');
const QRCode = require('./models/QRCode');
const KYC = require('./models/KYC');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://your-frontend-domain.com', // Add your production frontend URL here
    '*' // Allow all origins (for development, remove in production)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('MongoDB Connected');
      // Create initial admin after DB connection
      await createInitialAdmin();
    })
    .catch(err => console.log('DB Connection Error:', err));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
