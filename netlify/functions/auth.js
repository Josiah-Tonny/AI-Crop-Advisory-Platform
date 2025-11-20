// Netlify Function to handle auth API requests
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Create Express app
const app = express();

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in auth function:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Configure CORS to allow requests from the Netlify frontend
app.use(cors({
  origin: [
    'https://ai-advisory-agri.netlify.app', 
    'https://devserver-master--ai-advisory-agri.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Import and use auth routes
import authRoutes from '../../src/server/routes/auth.js';
app.use('/api/v1/auth', authRoutes);

// Compatibility route for old auth endpoint
app.post('/auth', (req, res) => {
  // Redirect to the appropriate auth endpoint based on action
  const { action } = req.body;
  
  switch (action) {
    case 'login':
      // Forward to login endpoint
      req.url = '/api/v1/auth/login';
      break;
    case 'register':
      // Forward to register endpoint
      req.url = '/api/v1/auth/register';
      break;
    case 'profile':
      // Forward to profile endpoint
      req.url = '/api/v1/auth/profile';
      break;
    case 'logout':
      // Forward to logout endpoint
      req.url = '/api/v1/auth/logout';
      break;
    default:
      return res.status(400).json({
        status: 'error',
        message: 'Invalid action parameter'
      });
  }
  
  // Re-dispatch the request to the appropriate route
  app.handle(req, res);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth function is running',
    timestamp: new Date().toISOString()
  });
});

// Export Netlify Function handler
export const handler = serverless(app, {
  basePath: '/api/v1/auth'
});