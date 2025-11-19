import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import the actual User model from your project
const User = (await import('./src/server/models/User.js')).default;

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/agri_advisor_dev';
    
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful');
    
    // List all users first
    const users = await User.find({}, 'email firstName lastName');
    console.log('\nAvailable users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
    });
    
    // Try to authenticate with a test user
    console.log('\n--- Testing Login ---');
    const email = 'test@example.com';
    const commonPasswords = ['password123', 'password', '12345678', 'test123', 'admin123'];
    
    console.log(`Attempting to login with email: ${email}`);
    
    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ User found');
    console.log(`User: ${user.firstName} ${user.lastName}`);
    
    // Check if password is set
    if (!user.password) {
      console.log('❌ No password set for user');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Password hash found');
    
    // Try different passwords
    console.log('Testing common passwords...');
    for (const password of commonPasswords) {
      console.log(`  Trying: ${password}`);
      const isMatch = await user.comparePassword(password);
      
      if (isMatch) {
        console.log(`✅ Password correct! Login successful with password: ${password}`);
        await mongoose.disconnect();
        return;
      }
    }
    
    console.log('❌ All common passwords failed');
    
    // Also try with the second user
    console.log('\n--- Testing with second user ---');
    const email2 = 'test4@example.com';
    console.log(`Attempting to login with email: ${email2}`);
    
    const user2 = await User.findOne({ email: email2.toLowerCase() }).select('+password');
    
    if (!user2) {
      console.log('❌ Second user not found');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✅ Second user found');
    console.log(`User: ${user2.firstName} ${user2.lastName}`);
    
    // Try different passwords for second user
    console.log('Testing common passwords...');
    for (const password of commonPasswords) {
      console.log(`  Trying: ${password}`);
      const isMatch = await user2.comparePassword(password);
      
      if (isMatch) {
        console.log(`✅ Password correct! Login successful with password: ${password}`);
        await mongoose.disconnect();
        return;
      }
    }
    
    console.log('❌ All common passwords failed for second user too');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

testLogin();