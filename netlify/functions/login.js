// Login function connected to your actual database
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

// User schema (matching your User model)
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot be longer than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot be longer than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'expert'],
    default: 'user'
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create User model
const User = mongoose.models.User || mongoose.model('User', userSchema);

exports.handler = async (event, context) => {
  // Enable response checking
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, x-api-key",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
        },
        body: ''
      };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Method not allowed'
        })
      };
    }
    
    // Parse request body
    const { email, password } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email and password are required'
        })
      };
    }
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URL, {
        dbName: process.env.DB_NAME || 'crops'
      });
    }
    
    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Invalid email or password'
        })
      };
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return {
        statusCode: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Invalid email or password'
        })
      };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'jiuytg2uhihopkmiuy78t6r5dfcgyjhiopklmjnyu7trfdcgjiopklmwdjnqit6rf5dcfgdvyubgiwhojnlkd3iu7yjiok',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'Login successful',
        token: token,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            isVerified: user.isVerified,
            subscriptionTier: user.subscriptionTier,
            createdAt: user.createdAt
          }
        }
      })
    };
  } catch (error) {
    console.error('Login function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'An error occurred during login',
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