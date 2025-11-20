// Test login function connected to your actual database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Simple User schema for testing
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

exports.handler = async (event, context) => {
  // Enable response checking
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    console.log('Test login function called with event:', event);
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URL, {
        dbName: process.env.DB_NAME || 'crops'
      });
    }
    
    // Test database connection by counting users
    const userCount = await User.countDocuments();
    
    // Return a success response with database info
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-api-key",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Test function working correctly with database connection',
        data: {
          timestamp: new Date().toISOString(),
          database: 'Connected',
          userCount: userCount
        }
      })
    };
  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'Test function failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  } finally {
    // Close database connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
    }
  }
};