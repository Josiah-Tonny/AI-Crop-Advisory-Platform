# AI Crop Advisory Platform - Setup Guide

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- OpenWeather API account (free)

### Step 1: Get API Keys

#### Required: OpenWeather API Key
1. Go to https://openweathermap.org/api
2. Click "Sign Up" and create a free account
3. Navigate to "API keys" in your account
4. Copy your API key
5. Note: Free tier includes:
   - Current weather data
   - 5-day/3-hour forecast
   - Air pollution data
   - 1,000 calls/day

### Step 2: Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env  # or use your preferred editor
```

### Step 3: Configure Minimum Required Variables

Edit `.env` and set these **REQUIRED** variables:

```bash
# REQUIRED: OpenWeather API Key
OPENWEATHER_API_KEY=your_actual_api_key_here
VITE_OPENWEATHER_API_KEY=your_actual_api_key_here

# REQUIRED: Generate a secure API key for backend authentication
# Run: openssl rand -hex 32
AIMLAPI_AI_API_KEY=generate_secure_32_char_hex_string
VITE_AIMLAPI_AI_API_KEY=same_as_above

# REQUIRED: Generate JWT secrets
# Run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=generate_secure_64_byte_hex_string
ACCESS_TOKEN_SECRET=generate_different_64_byte_hex_string
REFRESH_TOKEN_SECRET=generate_another_different_64_byte_hex_string

# Server Configuration (defaults are fine for development)
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Start the Application

#### Option A: Start Both Frontend & Backend Together
```bash
npm run dev:all
```

#### Option B: Start Separately (Recommended for Development)

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Step 6: Verify Installation

1. Open browser to http://localhost:5173
2. Navigate to "Weather" page
3. Search for a location (e.g., "Nairobi")
4. Verify real weather data loads
5. Navigate to "AI Advisory" page
6. Test irrigation recommendations

---

## Detailed Configuration Guide

### Database Setup (Optional)

The application can run without MongoDB (using mock auth routes), but for full functionality:

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Update .env
MONGODB_URL=mongodb://localhost:27017/agri_advisor_dev
DB_NAME=agri_advisor_dev
```

#### Option B: MongoDB Atlas (Cloud - Free Tier)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update .env:
```bash
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/agri_advisor_dev
DB_NAME=agri_advisor_dev
```

### Email Configuration (Optional)

For password reset and notification features:

```bash
# Gmail Example (requires App Password if 2FA enabled)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

### Admin Account Setup (Optional)

```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure_password_here
```

---

## API Keys Reference

### Required APIs

| API | Purpose | Free Tier | Sign Up URL |
|-----|---------|-----------|-------------|
| OpenWeather | Weather data, forecasts | 1,000 calls/day | https://openweathermap.org/api |

### Optional APIs

| API | Purpose | Free Tier | Sign Up URL | Status |
|-----|---------|-----------|-------------|--------|
| LocationIQ | Enhanced geocoding | 5,000 req/day | https://locationiq.com/ | Not yet integrated |
| Agro Monitoring | Satellite soil data | Limited | https://agromonitoring.com/ | Not yet integrated |
| OpenAI | Advanced AI features | Pay-per-use | https://platform.openai.com/ | Not yet integrated |

---

## Environment Variables Complete Reference

### Server Configuration
```bash
NODE_ENV=development          # development | production | test
PORT=5000                     # Server port
FRONTEND_URL=http://localhost:5173  # For CORS
APP_NAME=AI Crop Advisory Platform
```

### Database
```bash
MONGODB_URL=mongodb://localhost:27017/agri_advisor_dev
DB_NAME=agri_advisor_dev      # or agri_advisor_prod
```

### Authentication & Security
```bash
JWT_SECRET=your_64_byte_hex_here
ACCESS_TOKEN_SECRET=your_64_byte_hex_here
REFRESH_TOKEN_SECRET=your_64_byte_hex_here
```

### External APIs
```bash
# Required
OPENWEATHER_API_KEY=your_key
AIMLAPI_AI_API_KEY=your_key

# Optional
LOCATIONIQ_API_KEY=your_key
AGROMONITORING_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Frontend (Vite) Variables
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_OPENWEATHER_API_KEY=same_as_backend
VITE_AIMLAPI_AI_API_KEY=same_as_backend
VITE_LOCATIONIQ_API_KEY=optional
VITE_AGROMONITORING_API_KEY=optional
VITE_OPENAI_API_KEY=optional
```

---

## Generating Secure Keys

### Generate API Key (32 characters)
```bash
openssl rand -hex 32
```

### Generate JWT Secrets (64 bytes)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate Random Password
```bash
openssl rand -base64 32
```

---

## Verification Checklist

After setup, verify everything works:

### Backend Verification
```bash
# 1. Start backend
npm run server

# Should see:
# ✓ Server is running on port 5000
# ✓ Loaded irrigation routes
# ✓ MongoDB connected (if configured)

# 2. Test health endpoint
curl http://localhost:5000/api/health
# Should return: {"status":"success","message":"Server is running"}

# 3. Test irrigation endpoint (requires API keys)
curl -X POST http://localhost:5000/api/irrigation/recommend \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_AIMLAPI_KEY" \
  -d '{"location":{"lat":-1.286389,"lon":36.817223},"cropType":"maize"}'
# Should return irrigation schedule with real weather data
```

### Frontend Verification
```bash
# 1. Start frontend
npm run dev

# Should see:
# ✓ VITE ready
# ✓ Local: http://localhost:5173

# 2. Open browser to http://localhost:5173
# 3. Check browser console - should have NO errors about missing env vars
# 4. Navigate to Weather page - should load real weather data
# 5. Navigate to AI Advisory - should show irrigation recommendations
```

### Environment Variables Verification
```bash
# Check if all required variables are set
node -e "
const required = ['OPENWEATHER_API_KEY', 'AIMLAPI_AI_API_KEY', 'JWT_SECRET'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('❌ Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
console.log('✅ All required environment variables are set');
"
```

---

## Troubleshooting

### Issue: "OPENWEATHER_API_KEY not configured"
**Solution:**
1. Verify `.env` file exists in project root
2. Check `OPENWEATHER_API_KEY` is set (both with and without VITE_ prefix)
3. Restart both frontend and backend servers

### Issue: "Invalid or missing API key" (401 error)
**Solution:**
1. Check `AIMLAPI_AI_API_KEY` matches in both frontend and backend
2. Verify it's the same in `.env` (with VITE_ prefix for frontend)
3. Regenerate if needed: `openssl rand -hex 32`

### Issue: "Weather service temporarily unavailable" (503 error)
**Solution:**
1. Verify OpenWeather API key is valid
2. Check you haven't exceeded free tier limits (1,000 calls/day)
3. Test API key directly: `curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_KEY"`

### Issue: MongoDB connection errors
**Solution:**
1. If using local MongoDB, ensure it's running: `mongod --version`
2. Check `MONGODB_URL` format is correct
3. Application will run without MongoDB (using mock auth routes)

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify backend is running on port 5000
2. Check `VITE_API_BASE_URL=http://localhost:5000/api` in `.env`
3. Check CORS settings allow frontend URL

### Issue: "Module not found" errors
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

### Additional Configuration for Production

```bash
# .env.production
NODE_ENV=production
PORT=443  # or your production port
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Use different, more secure keys than development
OPENWEATHER_API_KEY=your_production_key
AIMLAPI_AI_API_KEY=different_secure_key_than_dev
JWT_SECRET=different_secure_secret_than_dev

# Production MongoDB
MONGODB_URL=mongodb+srv://prod_user:secure_pass@prod-cluster.mongodb.net/agri_advisor_prod
DB_NAME=agri_advisor_prod
```

### Security Checklist for Production
- [ ] Use HTTPS only
- [ ] Different API keys than development
- [ ] Strong, randomly generated secrets (64+ characters)
- [ ] Environment variables stored securely (e.g., AWS Secrets Manager)
- [ ] MongoDB with authentication enabled
- [ ] Rate limiting configured appropriately
- [ ] CORS restricted to your domain only
- [ ] Regular API key rotation
- [ ] Monitoring and logging enabled

---

## Next Steps

1. ✅ Complete setup using this guide
2. ✅ Verify all features work
3. 📖 Read `ENVIRONMENT_AUDIT.md` for detailed system analysis
4. 🧪 Test irrigation recommendations with different crops
5. 🚀 Implement remaining stub endpoints (soil analysis, crop recommendations)

---

## Support

- **Issues:** Report at [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation:** See `implementation-review.md` and `ENVIRONMENT_AUDIT.md`
- **Environment File:** See `.env.example` for all variables

## Quick Reference Commands

```bash
# Development
npm run dev:all          # Start both frontend & backend
npm run dev              # Start frontend only
npm run server           # Start backend only

# Production
npm run build            # Build frontend for production
npm start                # Start production server

# Testing
npm run test             # Run tests
npm run lint             # Check code quality
node test-irrigation.js  # Test irrigation implementation
```

---

**Last Updated:** 2025-10-22
**Version:** 1.0.0
**Minimum Node Version:** 18.0.0
