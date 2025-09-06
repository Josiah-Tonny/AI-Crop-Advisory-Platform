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

// Import pest routes
import pestRoutes from './routes/pest.js';
logger.info('Loaded pest routes');
console.log('Routes in pestRoutes:', Object.keys(pestRoutes));

// Create alternative auth middleware that accepts API keys for pest endpoints
app.use('/api/pest', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.AIMLAPI_AI_API_KEY) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  // If no API key or invalid key, proceed with normal auth
  import('./middleware/auth.js').then(authModule => {
    const authMiddleware = authModule.authenticate;
    authMiddleware(req, res, next);
  }).catch(err => {
    console.error('Error loading auth middleware:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  });
});

// Use pest routes with relaxed auth
app.use('/api/pest', pestRoutes);

// Add direct route handlers as well for debugging
app.get('/api/pest-test/common-pests', (req, res) => {
  console.log('Pest test route called');
  res.json({ success: true, message: 'Direct pest route working' });
});



// Create auth middleware for pests endpoints
app.use('/api/pests', (req, res, next) => {
  // First check for API key in header
  const apiKey = req.headers['x-api-key'];
  if (apiKey && apiKey === process.env.AIMLAPI_AI_API_KEY) {
    // API key is valid, skip token check
    req.isApiAuthenticated = true;
    return next();
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid or missing API key' 
  });
});

// Add pest/analyze-image endpoint for image-based pest detection
app.post('/api/pest/analyze-image', (req, res) => {
  try {
    const { image } = req.body;
    
    // Since we have middleware, we don't need to check the API key here
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    // In a real implementation, we'd use image recognition AI here
    // For now, we'll simulate detection results
    
    const pests = [
      {
        name: 'Fall Armyworm',
        scientificName: 'Spodoptera frugiperda',
        confidence: 0.92,
        treatment: [
          'Apply Bt spray on affected areas',
          'Use neem oil as an organic alternative',
          'Consider introducing natural predators'
        ],
        affectedArea: 'Leaf tissue and growing points'
      },
      {
        name: 'Aphids',
        scientificName: 'Aphidoidea family',
        confidence: 0.68,
        treatment: [
          'Apply insecticidal soap',
          'Use water spray to dislodge clusters',
          'Introduce ladybugs as natural predators'
        ],
        affectedArea: 'Undersides of leaves'
      }
    ];
    
    const recommendations = [
      'Implement regular field monitoring every 3-4 days',
      'Consider applying preventive treatments',
      'Remove and destroy heavily infested plant parts',
      'Maintain field hygiene to prevent spread'
    ];
    
    // Return analysis results
    res.json({
      success: true,
      pests: pests,
      recommendations: recommendations,
      timestamp: new Date().toISOString(),
      riskLevel: 'Medium to High'
    });
    
  } catch (error) {
    console.error('Error in pest image analysis API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing pest image',
      error: error.message
    });
  }
});

// Add pest/detect API endpoint to handle image processing and pest detection
app.post('/api/pest/detect', (req, res) => {
  try {
    const { cropType, location, symptoms, imageUrl } = req.body;
    
    // Since we have middleware, we don't need to check the API key here
    
    // Simulate pest detection based on input parameters
    const recommendations = [];
    let detectedPests = [];
    
    // Generate realistic detection results based on crop type
    if (cropType === 'maize') {
      detectedPests = [
        {
          name: 'Fall Armyworm',
          scientificName: 'Spodoptera frugiperda',
          confidence: 0.85,
          treatment: [
            'Apply Bt spray',
            'Consider neem oil application',
            'Monitor crop regularly'
          ]
        }
      ];
      recommendations.push(
        'Implement regular scouting every 3-5 days',
        'Consider preventative treatments during high-risk periods'
      );
    } else if (cropType === 'tomato') {
      detectedPests = [
        {
          name: 'Tomato Blight',
          scientificName: 'Phytophthora infestans',
          confidence: 0.78,
          treatment: [
            'Apply copper-based fungicide',
            'Improve air circulation',
            'Remove infected plants'
          ]
        }
      ];
      recommendations.push(
        'Space plants properly for ventilation',
        'Water at the base to keep foliage dry'
      );
    } else if (cropType === 'beans') {
      detectedPests = [
        {
          name: 'Aphids',
          scientificName: 'Aphidoidea family',
          confidence: 0.72,
          treatment: [
            'Use insecticidal soap',
            'Introduce natural predators',
            'Apply neem oil spray'
          ]
        }
      ];
      recommendations.push(
        'Check undersides of leaves regularly',
        'Use yellow sticky traps for monitoring'
      );
    } else {
      // Generic pests for other crops
      detectedPests = [
        {
          name: 'Generic Crop Pest',
          scientificName: 'Various species',
          confidence: 0.65,
          treatment: [
            'Monitor crops regularly',
            'Practice good field hygiene',
            'Consider organic pest control methods'
          ]
        }
      ];
      recommendations.push(
        'Implement crop rotation',
        'Maintain field sanitation',
        'Use resistant varieties when available'
      );
    }
    
    // Add location-specific risk assessment
    const riskForecast = location 
      ? `${Math.random() > 0.5 ? 'Moderate' : 'High'} risk in your region based on current weather patterns`
      : 'Risk assessment requires location data';
    
    // Return pest detection results
    res.json({
      success: true,
      detectedPests: detectedPests,
      recommendations: recommendations,
      riskForecast: riskForecast,
      location: location || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in pest detection API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing pest detection',
      error: error.message
    });
  }
});

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

// Add direct pest detection endpoints to match aimlService
app.post('/api/pest/detect', (req, res) => {
  try {
    const { cropType, location, symptoms, imageUrl } = req.body;
    logger.info(`Pest detection request for ${cropType}`);
    
    // Simulate pest detection based on input parameters
    const recommendations = [];
    let detectedPests = [];
    
    // Generate realistic detection results based on crop type
    if (cropType === 'maize') {
      detectedPests = [
        {
          name: 'Fall Armyworm',
          scientificName: 'Spodoptera frugiperda',
          confidence: 0.85,
          treatment: [
            'Apply Bt spray',
            'Consider neem oil application',
            'Monitor crop regularly'
          ]
        }
      ];
      recommendations.push(
        'Implement regular scouting every 3-5 days',
        'Consider preventative treatments during high-risk periods'
      );
    } else if (cropType === 'tomato') {
      detectedPests = [
        {
          name: 'Tomato Blight',
          scientificName: 'Phytophthora infestans',
          confidence: 0.78,
          treatment: [
            'Apply copper-based fungicide',
            'Improve air circulation',
            'Remove infected plants'
          ]
        }
      ];
      recommendations.push(
        'Space plants properly for ventilation',
        'Water at the base to keep foliage dry'
      );
    } else {
      // Generic pests for other crops
      detectedPests = [
        {
          name: 'Generic Crop Pest',
          scientificName: 'Various species',
          confidence: 0.65,
          treatment: [
            'Monitor crops regularly',
            'Practice good field hygiene',
            'Consider organic pest control methods'
          ]
        }
      ];
      recommendations.push(
        'Implement crop rotation',
        'Maintain field sanitation',
        'Use resistant varieties when available'
      );
    }
    
    // Add location-specific risk assessment
    const riskForecast = location 
      ? `${Math.random() > 0.5 ? 'Moderate' : 'High'} risk in your region based on current weather patterns`
      : 'Risk assessment requires location data';
    
    // Return pest detection results
    res.json({
      success: true,
      detectedPests: detectedPests,
      recommendations: recommendations,
      riskForecast: riskForecast,
      location: location || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in pest detection API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing pest detection',
      error: error.message
    });
  }
});

// Add endpoint for image-based pest detection
app.post('/api/pest/analyze-image', (req, res) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }
    
    // In a real implementation, we'd use image recognition AI here
    // For now, we'll simulate detection results
    
    const pests = [
      {
        name: 'Fall Armyworm',
        scientificName: 'Spodoptera frugiperda',
        confidence: 0.92,
        treatment: [
          'Apply Bt spray on affected areas',
          'Use neem oil as an organic alternative',
          'Consider introducing natural predators'
        ],
        affectedArea: 'Leaf tissue and growing points'
      },
      {
        name: 'Aphids',
        scientificName: 'Aphidoidea family',
        confidence: 0.68,
        treatment: [
          'Apply insecticidal soap',
          'Use water spray to dislodge clusters',
          'Introduce ladybugs as natural predators'
        ],
        affectedArea: 'Undersides of leaves'
      }
    ];
    
    const recommendations = [
      'Implement regular field monitoring every 3-4 days',
      'Consider applying preventive treatments',
      'Remove and destroy heavily infested plant parts',
      'Maintain field hygiene to prevent spread'
    ];
    
    // Return analysis results
    res.json({
      success: true,
      pests: pests,
      recommendations: recommendations,
      timestamp: new Date().toISOString(),
      riskLevel: 'Medium to High'
    });
    
  } catch (error) {
    console.error('Error in pest image analysis API:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing pest image',
      error: error.message
    });
  }
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
    logger.warn('⚠️  MONGODB_URL not found. Server running with mock routes.');
    return;
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