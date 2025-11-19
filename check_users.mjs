import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Define a simple user schema to read users
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' },
  subscriptionTier: { type: String, default: 'free' },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/agri_advisor_dev';
    console.log('Connecting to:', MONGODB_URL);
    
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful');
    
    // Check if users collection exists and count users
    const userCount = await User.countDocuments();
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'firstName lastName email role subscriptionTier isVerified isActive createdAt');
      console.log('\nUsers in database:');
      users.forEach(user => {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Role: ${user.role}, Verified: ${user.isVerified}, Active: ${user.isActive}`);
      });
    } else {
      console.log('\nNo users found in database. You need to register a user first.');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkUsers();