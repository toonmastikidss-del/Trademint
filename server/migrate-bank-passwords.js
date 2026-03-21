const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trademint', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Bank = require('./models/Bank');

async function migrateTransactionPasswords() {
  try {
    // console.log('🔄 Starting transaction password migration...\n');
    
    // Find all bank records
    const banks = await Bank.find({});
    // console.log(`Found ${banks.length} bank records to process\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const bank of banks) {
      try {
        // Check if transaction password looks like it's already hashed
        // Hashed passwords are typically 60+ characters
        if (bank.transactionPassword && bank.transactionPassword.length >= 60) {
          // console.log(`⏭️  Skipping bank ID: ${bank._id} (already hashed)`);
          skippedCount++;
          continue;
        }
        
        // Store original password
        const originalPassword = bank.transactionPassword;
        
        // Mark as modified to trigger hashing
        bank.markModified('transactionPassword');
        
        // Manually hash the password
        const salt = await bcrypt.genSalt(10);
        bank.transactionPassword = await bcrypt.hash(originalPassword, salt);
        
        await bank.save();
        
        // console.log(`✅ Migrated bank ID: ${bank._id}`);
        migratedCount++;
        
      } catch (err) {
        console.error(`❌ Error processing bank ID: ${bank._id}`, err.message);
        errorCount++;
      }
    }
    
    // console.log('\n===========================================');
    // console.log('📊 Migration Summary:');
    // console.log(`   Total processed: ${banks.length}`);
    // console.log(`   ✅ Migrated: ${migratedCount}`);
    // console.log(`   ⏭️  Skipped: ${skippedCount}`);
    // console.log(`   ❌ Errors: ${errorCount}`);
    // console.log('===========================================\n');
    
    if (errorCount === 0) {
      // console.log('🎉 Migration completed successfully!');
    } else {
      // console.log('⚠️  Migration completed with some errors. Please check the logs above.');
    }
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
  } finally {
    // Close database connection
    mongoose.connection.close();
    // console.log('\n👋 Database connection closed');
  }
}

// Run the migration
// console.log('🚀 Transaction Password Migration Script');
// console.log('========================================\n');
migrateTransactionPasswords();
