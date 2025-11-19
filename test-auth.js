// Simple test script to verify authentication is working
import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables:');
console.log('VITE_AIMLAPI_AI_API_KEY:', process.env.VITE_AIMLAPI_AI_API_KEY ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

// Test MongoDB connection
import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/agri_advisor_dev';
    console.log('Connecting to:', MONGODB_URL);
    
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }
};

testConnection();