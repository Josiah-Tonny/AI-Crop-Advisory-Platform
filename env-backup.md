# ============================================
# AI CROP ADVISORY PLATFORM - ENVIRONMENT VARIABLES
# ============================================

# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:5173

# Application Name
APP_NAME=AI Crop Advisory Platform

# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB connection string
MONGODB_URL=mongodb+srv://tonnyjosiah0:RoPir9xUMojez9xU@clustercrops.o4jur50.mongodb.net/

# Database name (dev or prod)
DB_NAME=crops

# ============================================
# AUTHENTICATION & SECURITY
# ============================================
# JWT Secret Keys (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="jiuytg2uhihopkmiuy78t6r5dfcgyjhiopklmjnyu7trfdcgjiopklmwdjnqit6rf5dcfgdvyubgiwhojnlkd3iu7yjiok"
ACCESS_TOKEN_SECRET="ytgn787tf7cv687u"
REFRESH_TOKEN_SECRET="hgtyfgcvhjioknhbyutxdcfgvyuhjiongutfsryctfvy7bgu78h9npoibvyufdturseyxcrutvby8giu"


### Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=technologieseidolon@gmail.com
MAIL_PASSWORD=tuapltysaypohevk
MAIL_DEFAULT_SENDER=AGRI AI PLATFORM <eidolontechnologies@gmail.com>


# ============================================
# EXTERNAL API KEYS
# ============================================

# OpenWeather API Key (REQUIRED for real-time weather data)
# Get your free API key at: https://openweathermap.org/api
OPENWEATHER_API_KEY="c6fbd54581688fcc0d5509271b63656c"

# AI/ML API Key (REQUIRED for backend API authentication)
# Generate a secure random string: openssl rand -hex 32
AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"
VITE_AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"


# LocationIQ API Key (Optional - for geocoding)
# Get your API key at: https://locationiq.com/
LOCATIONIQ_API_KEY="pk.9598243e10adf82a5bf5b4ec37f91ee6"

# Agro Monitoring API Key (Optional - for satellite soil data)
# Get your API key at: https://agromonitoring.com/
AGROMONITORING_API_KEY="4c9701473de7427083be0ec5b95d9efa"

# Trefle API Key (Optional - for plant database)
# Get your API key at: https://trefle.io/
TREFLE_API_KEY=your_trefle_api_key_here

# OpenAI API Key (Optional - for advanced AI features)
# Get your API key at: https://platform.openai.com/
VITE_OPENAI_API_KEY="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"


### Image Analysis
VITE_CLOUDINARY_API_KEY="739594788726412"  ### Image storage and analysis (generous free tier)
VITE_CLOUDINARY_API_SECRET="nxznHMRstCTrksqgZFhrR0d6Rjc"
VITE_CLOUDINARY_CLOUD_NAME="dl5rwjjol"
API_environment_variable="CLOUDINARY_URL=cloudinary://739594788726412:nxznHMRstCTrksqgZFhrR0d6Rjc@dl5rwjjol"

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
# SMTP settings for sending emails (password resets, notifications, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=technologieseidolon@gmail.com
SMTP_PASS=tuapltysaypohevk

# ============================================
# FRONTEND-ONLY VARIABLES (Vite - VITE_ prefix required)
# ============================================
# These variables are used by the React frontend
# They must start with VITE_ to be accessible in the browser

# Backend API URL (where the Express server is running)
VITE_API_BASE_URL=http://localhost:5000/api

# OpenWeather API Key (for frontend weather service)
# NOTE: This should ideally be the same as OPENWEATHER_API_KEY above
VITE_OPENWEATHER_API_KEY="c6fbd54581688fcc0d5509271b63656c"


# AI/ML API Key (for frontend to backend authentication)
# NOTE: This should match VITE_AIMLAPI_AI_API_KEY above
VITE_AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"

# LocationIQ API Key (Optional)
VITE_LOCATIONIQ_API_KEY="pk.9598243e10adf82a5bf5b4ec37f91ee6"

# Agro Monitoring API Key (Optional)
VITE_AGROMONITORING_API_KEY="4c9701473de7427083be0ec5b95d9efa"
# Trefle API Key (Optional)
VITE_TREFLE_API_KEY=your_trefle_api_key_here

# OpenAI API Key (Optional)
VITE_OPENAI_API_KEY="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"