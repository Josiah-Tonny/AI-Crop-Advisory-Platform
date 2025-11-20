const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database function
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    const MONGODB_URL = process.env.MONGODB_URL;
    const dbName = process.env.DB_NAME || 'crops';
    
    let connectionString = MONGODB_URL;
    if (MONGODB_URL.includes('mongodb+srv://')) {
      const urlParts = MONGODB_URL.split('/');
      if (urlParts.length >= 4) {
        const baseUrl = urlParts.slice(0, 3).join('/');
        const queryParams = urlParts[3].includes('?') ? '?' + urlParts[3].split('?')[1] : '';
        connectionString = `${baseUrl}/${dbName}${queryParams}`;
      }
    }
    
    await mongoose.connect(connectionString);
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Define User model
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin', 'expert'], default: 'user' },
  subscriptionTier: { type: String, enum: ['free', 'premium', 'enterprise'], default: 'free' },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Auth routes
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { email, password } = req.body;
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || !await user.comparePassword(password)) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during login'
    });
  }
});

app.post('/api/v1/auth/register', async (req, res) => {
  try {
    await connectToDatabase();
    
    const { firstName, lastName, email, password } = req.body;
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Export for serverless
module.exports = app;