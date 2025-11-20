// Netlify Function to handle API requests
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Create Express app
const app = express();

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error in API function:', err);
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

// Import and use all routes
import authRoutes from '../../src/server/routes/auth.js';
import userRoutes from '../../src/server/routes/users.js';
import discussionRoutes from '../../src/server/routes/discussions.js';
import pestRoutes from '../../src/server/routes/pest.js';
import irrigationRoutes from '../../src/server/routes/irrigation.js';
import cropRoutes from '../../src/server/routes/crops.js';
import soilRoutes from '../../src/server/routes/soil.js';
import educationRoutes from '../../src/server/routes/education.js';
import paymentRoutes from '../../src/server/routes/payments.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/pest', pestRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API function is running',
    timestamp: new Date().toISOString()
  });
});

// Export Netlify Function handler
export const handler = serverless(app, {
  basePath: '/api'
});