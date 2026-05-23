import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import mime from 'mime';
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
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  } : false
}));

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
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
import authenticate from './middleware/auth.js';

const SERVICE_API_KEY = process.env.AIMLAPI_AI_API_KEY || process.env.SERVICE_API_KEY;
const requireAuthOrServiceKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey && SERVICE_API_KEY && apiKey === SERVICE_API_KEY) {
    req.isApiAuthenticated = true;
    return next();
  }

  return authenticate(req, res, next);
};

// Use auth routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Import and configure discussions routes
import discussionRoutes from './routes/discussions.js';
logger.info('Loaded discussion routes');

// Use discussion routes with token or backend service key auth
app.use('/api/discussions', requireAuthOrServiceKey, discussionRoutes);

// Import pest routes
import pestRoutes from './routes/pest.js';
logger.info('Loaded pest routes');

// Use pest routes with token or backend service key auth
app.use('/api/pest', requireAuthOrServiceKey, pestRoutes);

// Add direct route handlers as well for debugging
app.get('/api/pest-test/common-pests', (req, res) => {
  res.json({ success: true, message: 'Direct pest route working' });
});

// Import and configure irrigation routes
import irrigationRoutes from './routes/irrigation.js';
logger.info('Loaded irrigation routes');
app.use('/api/irrigation', requireAuthOrServiceKey, irrigationRoutes);

// Import and configure crop routes
import cropRoutes from './routes/crops.js';
logger.info('Loaded crop routes');
app.use('/api/crops', requireAuthOrServiceKey, cropRoutes);

// Import and configure soil routes
import soilRoutes from './routes/soil.js';
logger.info('Loaded soil routes');
app.use('/api/soil', requireAuthOrServiceKey, soilRoutes);

// Import and configure education routes
import educationRoutes from './routes/education.js';
import aiRoutes from './routes/ai.js';
logger.info('Loaded education routes');
app.use('/api/education', requireAuthOrServiceKey, educationRoutes);

logger.info('Loaded AI proxy routes');
app.use('/api/ai', requireAuthOrServiceKey, aiRoutes);

import externalRoutes from './routes/external.js';
logger.info('Loaded external proxy routes');
app.use('/api/external', requireAuthOrServiceKey, externalRoutes);

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

  return requireAuthOrServiceKey(req, res, next);
});

app.use('/api/payments', paymentRoutes);

// Add a test route to verify the server is working
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API test route working',
    envVariables: {
      AIMLAPI_AI_API_KEY: process.env.AIMLAPI_AI_API_KEY ? 'Present (hidden)' : 'Missing',
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? 'Present (hidden)' : 'Missing'
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../../dist');
  
  // Serve static files with proper MIME types
  app.use(express.static(clientBuildPath, {
    setHeaders: (res, path) => {
      const mimeType = mime.getType(path);
      if (mimeType) {
        res.set('Content-Type', mimeType);
      }
    }
  }));

  // Handle SPA - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (!req.path.startsWith('/api/')) {
      return res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
    next();
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      status: 'fail',
      message: `Can't find ${req.originalUrl} on this server!`
    });
  }
  next();
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
  connectToDatabase().catch(error => {
    logger.error('❌ MongoDB connection failed:', error.message);
    logger.error('Server will continue running but database features will be unavailable.');
  });
});

async function connectToDatabase() {
  const MONGODB_URL = process.env.MONGODB_URL;
  
  if (!MONGODB_URL) {
    logger.error('❌ MONGODB_URL not found. Server cannot start without database connection.');
    // Don't exit the process, just log the error
    throw new Error('MONGODB_URL not found');
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
    logger.error('Database features will be unavailable until connection is restored.');
    // Don't exit the process, just throw the error to be caught above
    throw error;
  }
}