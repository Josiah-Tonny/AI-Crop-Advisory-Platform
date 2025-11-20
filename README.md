# AI Crop Advisory Platform

A comprehensive agricultural advisory platform that leverages AI to provide farmers with insights on crop management, pest control, irrigation scheduling, and more.

## Features

- **Crop Recommendations**: AI-powered crop suggestions based on soil conditions, climate, and location
- **Pest Identification**: Image-based pest detection and treatment recommendations
- **Irrigation Scheduler**: Optimized watering schedules based on weather forecasts and soil moisture
- **Soil Analysis**: Soil health assessment and improvement recommendations
- **Weather Integration**: Real-time weather data and forecasts
- **Community Forum**: Knowledge sharing platform for farmers
- **Educational Resources**: Courses and materials on modern farming techniques

## Tech Stack

### Frontend
- React with TypeScript
- Vite build tool
- TailwindCSS for styling
- ShadCN UI components

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Netlify Functions for serverless deployment

### APIs & Services
- OpenWeatherMap for weather data
- Cloudinary for image storage and processing
- Stripe for payment processing

## Deployment

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=https://ai-advisory-agri.netlify.app

# Database Configuration
MONGODB_URL=your_mongodb_connection_string
DB_NAME=crops

# Authentication & Security
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# External API Keys
OPENWEATHER_API_KEY=your_openweather_api_key
AIMLAPI_AI_API_KEY=your_aimlapi_key
VITE_AIMLAPI_AI_API_KEY=your_aimlapi_key

# Frontend Variables (Vite - VITE_ prefix required)
VITE_API_BASE_URL=
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_AIMLAPI_AI_API_KEY=your_aimlapi_key
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start both frontend and backend:
   ```bash
   npm run dev:all
   ```

3. Or start frontend and backend separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev:frontend
   
   # Terminal 2 - Backend
   npm run dev:backend
   ```

### Production Deployment

The application is configured for deployment on Netlify with serverless functions. The following endpoints are available:

- `/api/v1/auth/*` - Authentication endpoints (login, register, profile, logout)
- `/api/v1/users/*` - User management
- `/api/discussions/*` - Community discussions
- `/api/pest/*` - Pest identification and treatment
- `/api/irrigation/*` - Irrigation scheduling
- `/api/crops/*` - Crop recommendations
- `/api/soil/*` - Soil analysis
- `/api/education/*` - Educational resources
- `/api/payments/*` - Payment processing

All API requests are handled through Netlify Functions, eliminating the need for a separate backend server.

## CORS Configuration

CORS is properly configured to allow requests from:
- `http://localhost:5173` (development)
- `https://ai-advisory-agri.netlify.app` (production)
- `https://devserver-master--ai-advisory-agri.netlify.app` (preview deployments)

## Troubleshooting

### CORS Errors

If you encounter CORS errors:
1. Ensure the frontend URL is correctly configured in `FRONTEND_URL`
2. Verify that the origin is included in the CORS configuration in `src/server/index.js`
3. Check that Netlify redirects are properly configured in `netlify.toml`

### Authentication Issues

If login/register is not working:
1. Verify that the auth function is deployed correctly
2. Check that the API endpoints are correctly configured
3. Ensure environment variables are set correctly

### Netlify Function Errors

If Netlify functions are not working:
1. Check the function logs in the Netlify dashboard
2. Verify that all dependencies are included
3. Ensure the function paths are correctly configured in `netlify.toml`
