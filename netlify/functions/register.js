// Register function connected to your actual database
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
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Accepts international format (+254...) or local format (07... or 01...)
        return !v || /^($\d{1,3}[- ]?)?\d{9,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  location: {
    type: String,
    trim: true
  },
  farmSize: {
    type: String,
    enum: ['small', 'medium', 'large', ''],
    default: ''
  },
  cropTypes: [{
    type: String,
    trim: true
  }],
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

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
    const { email, password, firstName, lastName, phone, location, farmSize, cropTypes } = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'Email, password, first name, and last name are required'
        })
      };
    }
    
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URL, {
        dbName: process.env.DB_NAME || 'crops'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          status: 'error',
          message: 'User already exists with this email'
        })
      };
    }
    
    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      phone,
      location,
      farmSize,
      cropTypes,
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'jiuytg2uhihopkmiuy78t6r5dfcgyjhiopklmjnyu7trfdcgjiopklmwdjnqit6rf5dcfgdvyubgiwhojnlkd3iu7yjiok',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
    
    // Return success response
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'success',
        message: 'User registered successfully',
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
    console.error('Register function error:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: 'error',
        message: 'An error occurred during registration',
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