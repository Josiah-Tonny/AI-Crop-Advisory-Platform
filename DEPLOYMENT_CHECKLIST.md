# Deployment Checklist

## Pre-deployment Checks

- [ ] Update all environment variables in Netlify dashboard
- [ ] Verify CORS configuration includes all deployment URLs
- [ ] Test Netlify functions locally using Netlify CLI
- [ ] Check that all API endpoints are correctly routed
- [ ] Verify database connection settings
- [ ] Confirm API keys are properly configured

## Netlify Configuration

- [ ] Environment variables set in Netlify dashboard:
  - NODE_ENV=production
  - FRONTEND_URL=https://ai-advisory-agri.netlify.app
  - MONGODB_URL=***
  - DB_NAME=crops
  - JWT_SECRET=***
  - ACCESS_TOKEN_SECRET=***
  - REFRESH_TOKEN_SECRET=***
  - OPENWEATHER_API_KEY=***
  - AIMLAPI_AI_API_KEY=***
  - VITE_AIMLAPI_AI_API_KEY=***

- [ ] Build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Functions directory: `netlify/functions`

- [ ] Redirects configured in netlify.toml:
  - /api/* → /.netlify/functions/api
  - /api/v1/auth/* → /.netlify/functions/auth
  - /auth → /.netlify/functions/auth
  - /* → /index.html (SPA fallback)

## Post-deployment Verification

- [ ] Test authentication endpoints
- [ ] Verify CORS headers are present
- [ ] Check that all API routes are accessible
- [ ] Test database connectivity
- [ ] Validate API key authentication
- [ ] Confirm error handling works correctly

## Common Issues and Solutions

### CORS Errors
- Solution: Ensure FRONTEND_URL matches deployed URL
- Solution: Verify CORS origins in server configuration

### Authentication Failures
- Solution: Check JWT secret configuration
- Solution: Verify user model and database connection

### Function Deployment Errors
- Solution: Check function dependencies in package.json
- Solution: Verify function file paths and exports

### Database Connection Issues
- Solution: Confirm MONGODB_URL format and credentials
- Solution: Check database firewall settings