const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Model
const UserSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 0 },
  quantify: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  lastActive: Date,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('TestUser', UserSchema);

// Deposit Model
const DepositSchema = new mongoose.Schema({
  userId: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  screenshot: String,
  createdAt: { type: Date, default: Date.now }
});

const Deposit = mongoose.model('TestDeposit', DepositSchema);

// Quantify Model
const QuantifySchema = new mongoose.Schema({
  userId: String,
  mode: { type: String, enum: ['current', 'quantify'], default: 'current' },
  balance: Number,
  totalRevenue: Number,
  todayEarning: Number,
  isQuantifying: { type: Boolean, default: false },
  lastActivityDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const Quantify = mongoose.model('TestQuantify', QuantifySchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trademint', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing test users
    await User.deleteMany({ phone: { $in: ['9876543210', '9876543211', '9876543212', '9876543213'] } });
    console.log('🗑️  Cleared existing test users');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // ========== ID 1: PURANA ACCOUNT (Daily Quantify + ₹2000+ Deposit + Working) ==========
    const user1 = new User({
      name: 'Rajesh Kumar',
      phone: '9876543210',
      password: hashedPassword,
      balance: 5000,
      quantify: 8500,
      status: 'Active',
      lastActive: new Date(),
      createdAt: new Date('2024-01-15') // 14 months old account
    });
    await user1.save();
    
    // Add multiple approved deposits (total ₹5000)
    await Deposit.create([
      { userId: user1._id, amount: 2000, status: 'approved', createdAt: new Date('2024-01-15') },
      { userId: user1._id, amount: 1500, status: 'approved', createdAt: new Date('2024-02-10') },
      { userId: user1._id, amount: 1500, status: 'approved', createdAt: new Date('2024-03-05') }
    ]);
    
    // Active quantifying record
    await Quantify.create({
      userId: user1._id,
      mode: 'current',
      balance: 5000,
      totalRevenue: 8500,
      todayEarning: 300,
      isQuantifying: true,
      lastActivityDate: new Date()
    });
    
    console.log('✅ ID 1 Created: 9876543210 (Purana - Daily Quantify + ₹5000 Deposit)');
    
    // ========== ID 2: MEDIUM ACCOUNT (Regular + ₹5000 Deposit) ==========
    const user2 = new User({
      name: 'Amit Sharma',
      phone: '9876543211',
      password: hashedPassword,
      balance: 3000,
      quantify: 4200,
      status: 'Active',
      lastActive: new Date(),
      createdAt: new Date('2024-06-01') // 9 months old
    });
    await user2.save();
    
    await Deposit.create({
      userId: user2._id,
      amount: 5000,
      status: 'approved',
      createdAt: new Date('2024-06-01')
    });
    
    await Quantify.create({
      userId: user2._id,
      mode: 'current',
      balance: 3000,
      totalRevenue: 4200,
      todayEarning: 180,
      isQuantifying: true,
      lastActivityDate: new Date()
    });
    
    console.log('✅ ID 2 Created: 9876543211 (Medium - Regular + ₹5000 Deposit)');
    
    // ========== ID 3: NEW ACCOUNT (Just Started Quantifying) ==========
    const user3 = new User({
      name: 'Vikram Singh',
      phone: '9876543212',
      password: hashedPassword,
      balance: 1000,
      quantify: 1150,
      status: 'Active',
      lastActive: new Date(),
      createdAt: new Date('2024-10-01') // 5 months old
    });
    await user3.save();
    
    await Deposit.create({
      userId: user3._id,
      amount: 1000,
      status: 'approved',
      createdAt: new Date('2024-10-01')
    });
    
    await Quantify.create({
      userId: user3._id,
      mode: 'current',
      balance: 1000,
      totalRevenue: 1150,
      todayEarning: 60,
      isQuantifying: true,
      lastActivityDate: new Date()
    });
    
    console.log('✅ ID 3 Created: 9876543212 (New - Just Started Quantifying)');
    
    // ========== ID 4: FRESH ACCOUNT (No Deposit Yet) ==========
    const user4 = new User({
      name: 'Arjun Patel',
      phone: '9876543213',
      password: hashedPassword,
      balance: 0,
      quantify: 0,
      status: 'Active',
      lastActive: new Date(),
      createdAt: new Date('2024-11-01') // 4 months old
    });
    await user4.save();
    
    await Quantify.create({
      userId: user4._id,
      mode: 'current',
      balance: 0,
      totalRevenue: 0,
      todayEarning: 0,
      isQuantifying: false,
      lastActivityDate: new Date()
    });
    
    console.log('✅ ID 4 Created: 9876543213 (Fresh - No Deposit Yet)');
    
    console.log('\n===========================================');
    console.log('📊 ALL TEST IDS CREATED SUCCESSFULLY!');
    console.log('===========================================');
    console.log('\n📋 Test Accounts Summary:');
    console.log('-----------------------------------------');
    console.log('ID 1: 9876543210 | Password: password123');
    console.log('   Name: Rajesh Kumar');
    console.log('   Balance: ₹5,000 | Quantify: ₹8,500');
    console.log('   Total Deposit: ₹5,000 (3 deposits)');
    console.log('   Age: 14 months | Daily Quantifying ✅');
    console.log('-----------------------------------------');
    console.log('ID 2: 9876543211 | Password: password123');
    console.log('   Name: Amit Sharma');
    console.log('   Balance: ₹3,000 | Quantify: ₹4,200');
    console.log('   Total Deposit: ₹5,000');
    console.log('   Age: 9 months | Regular Quantifying ✅');
    console.log('-----------------------------------------');
    console.log('ID 3: 9876543212 | Password: password123');
    console.log('   Name: Vikram Singh');
    console.log('   Balance: ₹1,000 | Quantify: ₹1,150');
    console.log('   Total Deposit: ₹1,000');
    console.log('   Age: 5 months | Started Quantifying ✅');
    console.log('-----------------------------------------');
    console.log('ID 4: 9876543213 | Password: password123');
    console.log('   Name: Arjun Patel');
    console.log('   Balance: ₹0 | Quantify: ₹0');
    console.log('   Total Deposit: ₹0');
    console.log('   Age: 4 months | No Deposit Yet');
    console.log('-----------------------------------------');
    console.log('\n🔐 Common Password: password123');
    console.log('\n💡 You can now login with these IDs and test the withdrawal flow!');
    console.log('===========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test IDs:', error);
    process.exit(1);
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});
