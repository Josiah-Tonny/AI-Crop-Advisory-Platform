import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple logger
const logger = {
  info: (msg) => {}, // Silent logging
  error: (msg) => {}, // Silent logging
  warn: (msg) => {}, // Silent logging
};

// Initialize express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Configure CORS to allow the x-api-key header
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
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Health check endpoint (before database connection)
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    port: process.env.PORT || 5000
  });
});

// Import auth routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Use auth routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Import and configure discussions routes
import discussionRoutes from './routes/discussions.js';
logger.info('Loaded discussion routes');

// Create auth middleware for discussion endpoints
app.use('/api/discussions', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  // If no API key or invalid key, proceed with normal auth
  import('./middleware/auth.js').then(authModule => {
    // Use default export for ES module compatibility
    const authMiddleware = authModule.default;
    authMiddleware(req, res, next);
  }).catch(err => {
    console.error('Error loading auth middleware:', err);
    // Error handling for loading auth middleware
    throw err;
  });
});

// Use discussion routes
app.use('/api/discussions', discussionRoutes);

// Import pest routes
import pestRoutes from './routes/pest.js';
logger.info('Loaded pest routes');
console.log('Routes in pestRoutes:', Object.keys(pestRoutes));

// Create alternative auth middleware that accepts API keys for pest endpoints
app.use('/api/pest', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  // If no API key or invalid key, proceed with normal auth
  import('./middleware/auth.js').then(authModule => {
    // Use default export for ES module compatibility
    const authMiddleware = authModule.default;
    authMiddleware(req, res, next);
  }).catch(err => {
    console.error('Error loading auth middleware:', err);
    // Error handling for loading auth middleware
    throw err;
  });
});

// Use pest routes with relaxed auth
app.use('/api/pest', pestRoutes);

// Add direct route handlers as well for debugging
app.get('/api/pest-test/common-pests', (req, res) => {
  console.log('Pest test route called');
  res.json({ success: true, message: 'Direct pest route working' });
});

// Import and configure irrigation routes
import irrigationRoutes from './routes/irrigation.js';
logger.info('Loaded irrigation routes');

// Create auth middleware for irrigation endpoints (same pattern as pest)
app.use('/api/irrigation', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or missing API key' 
  });
});

// Use irrigation routes
app.use('/api/irrigation', irrigationRoutes);

// Import and configure crop routes
import cropRoutes from './routes/crops.js';
logger.info('Loaded crop routes');

// Create auth middleware for crop endpoints (same pattern as pest)
app.use('/api/crops', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or missing API key' 
  });
});

// Use crop routes
app.use('/api/crops', cropRoutes);

// Import and configure soil routes
import soilRoutes from './routes/soil.js';
logger.info('Loaded soil routes');

// Create auth middleware for soil endpoints (same pattern as pest)
app.use('/api/soil', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or missing API key' 
  });
});

// Use soil routes
app.use('/api/soil', soilRoutes);

// Import and configure education routes
import educationRoutes from './routes/education.js';
logger.info('Loaded education routes');

// Create auth middleware for education endpoints (same pattern as pest)
app.use('/api/education', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or missing API key' 
  });
});

// Use education routes
app.use('/api/education', educationRoutes);

// Import and configure payment routes
import paymentRoutes from './routes/payments.js';
logger.info('Loaded payment routes');

// Payment routes - require authentication
app.use('/api/payments', (req, res, next) => {
  // Allow unauthenticated access to plans endpoint
  if (req.path === '/plans' && req.method === 'GET') {
    return next();
  }
  
  // Allow webhooks without auth (they verify with signatures)
  if (req.path.includes('/webhook') || req.path.includes('/callback')) {
    return next();
  }
  
  // For all other payment endpoints, require API key
  const apiKey = req.headers['x-api-key'];
  if (apiKey && (apiKey === process.env.AIMLAPI_AI_API_KEY || apiKey === process.env.VITE_AIMLAPI_AI_API_KEY)) {
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Authentication required' 
  });
});

app.use('/api/payments', paymentRoutes);

// Add a test route to verify the server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working',
    envVariables: {
      AIMLAPI_AI_API_KEY: (process.env.AIMLAPI_AI_API_KEY || process.env.VITE_AIMLAPI_AI_API_KEY) ? 'Present (hidden)' : 'Missing',
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? 'Present (hidden)' : 'Missing'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server first, then try to connect to database
const port = process.env.PORT || 5000;
const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 Server running on http://localhost:${port}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Try to connect to MongoDB after server starts
  connectToDatabase();
});

async function connectToDatabase() {
  const MONGODB_URL = process.env.MONGODB_URL;
  
  if (!MONGODB_URL) {
    logger.error('❌ MONGODB_URL not found. Server cannot start without database connection.');
    process.exit(1);
  }
  
  try {
    // Determine database name - use DB_NAME from .env if available, otherwise use environment-based defaults
    const dbName = process.env.DB_NAME || (process.env.NODE_ENV === 'production' ? 'agri_advisor_prod' : 'agri_advisor_dev');
    
    // Build connection string
    let connectionString = MONGODB_URL;
    if (MONGODB_URL.includes('mongodb+srv://')) {
      const urlParts = MONGODB_URL.split('/');
      if (urlParts.length >= 4) {
        const baseUrl = urlParts.slice(0, 3).join('/');
        const queryParams = urlParts[3].includes('?') ? '?' + urlParts[3].split('?')[1] : '';
        connectionString = `${baseUrl}/${dbName}${queryParams}`;
      }
    }
    
    logger.info(`🔗 Connecting to database: ${dbName}`);
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    logger.info('✅ Successfully connected to MongoDB Atlas');
    
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    logger.error('Server cannot start without database connection.');
    process.exit(1);
  }
}