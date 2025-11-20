// Netlify Function to handle API requests
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// Configure CORS to allow requests from the Netlify frontend
app.use(cors({
  origin: ['https://ai-advisory-agri.netlify.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API function is running',
    timestamp: new Date().toISOString()
  });
});

// Export Netlify Function handler
export const handler = serverless(app);