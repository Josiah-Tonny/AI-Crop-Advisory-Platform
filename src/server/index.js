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
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`)
};

// Initialize express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
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

// Variable to track if real routes are loaded
let realRoutesLoaded = false;

// Mock routes - only used when database is not connected
const setupMockRoutes = () => {
  if (realRoutesLoaded) return; // Don't set up mock routes if real ones are loaded

  app.post('/api/v1/auth/register', async (req, res) => {
    try {
      logger.info('Registration attempt (mock):', req.body.email);
      
      return res.status(200).json({
        status: 'success',
        message: 'Registration successful (mock mode)',
        data: {
          user: {
            id: 'mock_user_id',
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            name: `${req.body.firstName} ${req.body.lastName}`,
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        },
        token: 'mock_token_12345'
      });
      
    } catch (error) {
      logger.error('Registration error (mock):', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      logger.info('Login attempt (mock):', req.body.email);
      
      return res.status(200).json({
        status: 'success',
        message: 'Login successful (mock mode)',
        data: {
          user: {
            id: 'mock_user_id',
            email: req.body.email,
            firstName: 'Test',
            lastName: 'User',
            name: 'Test User',
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        },
        token: 'mock_token_12345'
      });
      
    } catch (error) {
      logger.error('Login error (mock):', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });

  app.get('/api/v1/auth/profile', async (req, res) => {
    try {
      // Mock profile response
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: 'mock_user_id',
            email: 'user@example.com',
            firstName: 'Test',
            lastName: 'User',
            name: 'Test User',
            role: 'user',
            isVerified: true,
            subscriptionTier: 'free',
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      logger.error('Profile error (mock):', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  });
};

// Setup mock routes initially
setupMockRoutes();

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
    logger.warn('⚠️  MONGODB_URL not found. Server running with mock routes.');
    return;
  }
  
  try {
    // Determine database name
    const dbName = process.env.NODE_ENV === 'production' ? 'agri_advisor_prod' : 'agri_advisor_dev';
    
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
    
    // Load real routes after successful DB connection
    try {
      // Clear existing routes
      app._router.stack = app._router.stack.filter(layer => {
        return !layer.route || !layer.route.path.startsWith('/api/v1/auth');
      });
      
      const authModule = await import('./routes/auth.js');
      const userModule = await import('./routes/users.js');
      
      app.use('/api/v1/auth', authModule.default);
      app.use('/api/v1/users', userModule.default);
      
      realRoutesLoaded = true;
      logger.info('✅ Database routes loaded successfully');
    } catch (routeError) {
      logger.warn('⚠️  Could not load database routes:', routeError.message);
      logger.warn('Using mock endpoints');
    }
    
  } catch (error) {
    logger.warn('⚠️  MongoDB connection failed:', error.message);
    logger.warn('Server continuing with mock routes...');
  }
}