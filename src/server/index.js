import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from './utils/Logger.js';

// Create __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();

// Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection - disabled due to conflict
// app.use(xss()); // Data sanitization against XSS - temporarily disabled  
// app.use(hpp()); // Prevent parameter pollution - temporarily disabled

// Rate limiting
const limiter = rateLimit({
  max: 100, // limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// Database connection
const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  logger.error('❌ MONGODB_URL is not defined in environment variables');
  logger.error('Please make sure your .env file contains MONGODB_URL with your Atlas connection string');
  process.exit(1);
}

// Determine database name based on environment
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
let dbName;

if (isTest) {
  dbName = 'test';
} else if (isProduction) {
  dbName = 'crops';
} else {
  // Development environment - use crops for now, can be changed
  dbName = 'crops';
}

// Replace database name in connection string
let connectionString = MONGODB_URL;
if (MONGODB_URL.includes('mongodb+srv://')) {
  // For Atlas connection strings, add database name
  if (MONGODB_URL.endsWith('/')) {
    // URL ends with /, just append database name
    connectionString = `${MONGODB_URL}${dbName}`;
  } else {
    // URL has database name or query params, replace appropriately
    const urlParts = MONGODB_URL.split('/');
    if (urlParts.length >= 4) {
      const baseUrl = urlParts.slice(0, 3).join('/');
      const queryParams = urlParts[3].includes('?') ? '?' + urlParts[3].split('?')[1] : '';
      connectionString = `${baseUrl}/${dbName}${queryParams}`;
    }
  }
}

logger.info(`🔗 Connecting to database: ${dbName}`);

// Remove deprecated options and add retryWrites for Atlas
mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: 'majority'
})
.then(async () => {
  logger.info('✅ Successfully connected to MongoDB Atlas');
  
  try {
    // Import routes after successful DB connection
    logger.info('Loading auth routes...');
    const authModule = await import('./routes/auth.js');
    app.use('/api/v1/auth', authModule.default);
    logger.info('Auth routes loaded successfully');
    
    logger.info('Loading user routes...');
    const userModule = await import('./routes/users.js');
    app.use('/api/v1/users', userModule.default);
    logger.info('User routes loaded successfully');
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: dbStatus
      });
    });
    
    // 404 handler
    logger.info('Setting up 404 handler...');
    app.use((req, res) => {
      res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
      });
    });
    logger.info('404 handler set up successfully');
    
    // Error handling middleware
    app.use((err, req, res, next) => {
      logger.error('Error:', err);
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    });
    
    // Start the server
    const port = 5000; // Force port 5000 for development
    const server = app.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on http://localhost:${port}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    logger.error('❌ Failed to load routes:', error);
    process.exit(1);
  }
  
}).catch((err) => {
  logger.error('❌ MongoDB connection error:', err.message);
  logger.error('Please check:');
  logger.error('1. Your internet connection');
  logger.error('2. MongoDB Atlas cluster is running and accessible');
  logger.error('3. Your IP is whitelisted in MongoDB Atlas Network Access');
  logger.error('4. Database user has correct permissions');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});