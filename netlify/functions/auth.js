// Netlify Function to handle auth API requests
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Configure CORS to allow requests from all necessary origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://ai-advisory-agri.netlify.app',
      'https://devserver-master--ai-advisory-agri.netlify.app',
      'http://localhost:5000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'x-api-key',
    'x-access-token',
    'x-auth-token'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'x-auth-token',
    'x-refresh-token'
  ],
  maxAge: 600,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Test endpoint
app.get('/.netlify/functions/auth/test', (req, res) => {
  res.json({ status: 'success', message: 'Auth function is working' });
});

// Health check endpoint
app.get('/.netlify/functions/auth/health', async (req, res) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    res.json({ 
      status: 'success', 
      message: 'Auth function is healthy',
      mongo: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Import and use auth routes
const authRoutes = require('../../src/server/routes/auth.js');

// Mount routes with the correct base path for Netlify Functions
app.use('/.netlify/functions/auth', authRoutes);

// Connect to MongoDB and start the server
const startServer = async () => {
  await connectDB();
  
  // Start the server only in local development
  if (process.env.NETLIFY_DEV) {
    const port = process.env.PORT || 8888;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }
};

// Initialize the server
startServer().catch(console.error);

// Export Netlify Function handler
module.exports.handler = serverless(app);

// For local development
if (process.env.NETLIFY_DEV) {
  console.log('Running in Netlify Dev mode');
}