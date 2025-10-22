# Environment Configuration Issues & Fixes

## 🔴 Critical Issues Found in Your .env File

### Issue #1: Missing Backend API Keys ❌ CRITICAL

**Problem:**
Your backend services (especially the new irrigation service) cannot access OpenWeather API because you only have `VITE_OPENWEATHER_API_KEY` (frontend) but not `OPENWEATHER_API_KEY` (backend).

**Current .env:**
```bash
VITE_OPENWEATHER_API_KEY="c6fbd54581688fcc0d5509271b63656c"  # ✅ Frontend can use this
# MISSING: OPENWEATHER_API_KEY  # ❌ Backend cannot access weather data!
```

**Why This Breaks Irrigation Service:**
```javascript
// Backend: src/server/services/weatherFetcher.js
const apiKey = process.env.OPENWEATHER_API_KEY;  // ❌ Returns undefined!

if (!apiKey) {
  throw new Error('OPENWEATHER_API_KEY not configured');  // ❌ This error will occur
}
```

**Fix:**
```bash
# Add this line to your .env:
OPENWEATHER_API_KEY="c6fbd54581688fcc0d5509271b63656c"
```

---

### Issue #2: Insecure API Key ⚠️ SECURITY

**Problem:**
Your `AIMLAPI_AI_API_KEY` is a weak, potentially exposed key.

**Current .env:**
```bash
AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"  # ⚠️ Only 32 characters, may be compromised
```

**Why This Is a Problem:**
1. This key appears in code examples and may be publicly known
2. It's only 32 characters (should be 64+ for security)
3. It's used for ALL backend API authentication

**Fix:**
```bash
# Replace with new secure key (generated with crypto.randomBytes(32)):
AIMLAPI_AI_API_KEY="cc6c3a7bff08e53af3c12adb5542241e8a023f17369ccb7c52b40fb04f9a3ce4"
```

---

### Issue #3: Missing Frontend API Key ❌ CRITICAL

**Problem:**
Frontend cannot authenticate with backend because `VITE_AIMLAPI_AI_API_KEY` is missing.

**Current .env:**
```bash
AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"  # Backend only
# MISSING: VITE_AIMLAPI_AI_API_KEY  # ❌ Frontend has no key!
```

**Why This Breaks Frontend:**
```typescript
// Frontend: src/services/aimlService.ts
const AIMLAPI_AI_API_KEY = import.meta.env.VITE_AIMLAPI_AI_API_KEY;  // ❌ Returns undefined!

if (!AIMLAPI_AI_API_KEY) {
  console.error('VITE_AIMLAPI_AI_API_KEY is not configured');  // ❌ This error will show
}

// All API calls will fail with 401 Unauthorized
```

**Fix:**
```bash
# Add this line (must match backend key):
VITE_AIMLAPI_AI_API_KEY="cc6c3a7bff08e53af3c12adb5542241e8a023f17369ccb7c52b40fb04f9a3ce4"
```

---

### Issue #4: Missing JWT Secrets ❌ CRITICAL

**Problem:**
You have `JWT_SECRET` but missing `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.

**Current .env:**
```bash
JWT_SECRET=cje89ueiojf4589j2guirhf8i485gijn45h8pojn45uhopo45jfgi4jng5uhgp45ong458g9j4biugip45hognl45igoj5igh45togjnt4igh5pohgi45gj45o  # ✅ Present
# MISSING: ACCESS_TOKEN_SECRET  # ❌ Needed for refresh tokens
# MISSING: REFRESH_TOKEN_SECRET  # ❌ Needed for refresh tokens
```

**Why This May Cause Issues:**
Your auth system may expect these for token refresh functionality. Without them, refresh tokens won't work properly.

**Fix:**
```bash
# Add these lines (generated with crypto.randomBytes(64)):
ACCESS_TOKEN_SECRET="b4db149b295adcf5101f1590a4a07c306721d672ab199fc3bfe6432e994414aa08649e96a8eea9bf02c0eebc6b281f7c73c552a279b379dbc75b385fe4b8d6d4"
REFRESH_TOKEN_SECRET="39d4c540e6b215e386a56b23818bd5bb99231acf913264527b8858242aac87882b333c6ce409c987a803e9f334535a487357cd930db74c55e1fea7920c736679"
```

---

## 📋 Summary of All Missing Variables

| Variable | Status | Used By | Priority |
|----------|--------|---------|----------|
| `OPENWEATHER_API_KEY` | ❌ Missing | Backend weather fetcher | 🔴 CRITICAL |
| `VITE_AIMLAPI_AI_API_KEY` | ❌ Missing | Frontend API calls | 🔴 CRITICAL |
| `ACCESS_TOKEN_SECRET` | ❌ Missing | JWT token refresh | 🔴 CRITICAL |
| `REFRESH_TOKEN_SECRET` | ❌ Missing | JWT token refresh | 🔴 CRITICAL |
| `AIMLAPI_AI_API_KEY` | ⚠️ Weak | Backend auth | ⚠️ SECURITY |

---

## 🔧 How to Fix (Step by Step)

### Option 1: Manual Fix (Recommended)

**Step 1:** Open your `.env` file
```bash
nano .env  # or use your preferred editor
```

**Step 2:** Add these lines at the end:
```bash
# ===== CRITICAL FIXES - ADD THESE LINES =====

# Backend needs OpenWeather key WITHOUT VITE_ prefix
OPENWEATHER_API_KEY="c6fbd54581688fcc0d5509271b63656c"

# Frontend needs secure API key WITH VITE_ prefix
VITE_AIMLAPI_AI_API_KEY="cc6c3a7bff08e53af3c12adb5542241e8a023f17369ccb7c52b40fb04f9a3ce4"

# JWT token refresh secrets
ACCESS_TOKEN_SECRET="b4db149b295adcf5101f1590a4a07c306721d672ab199fc3bfe6432e994414aa08649e96a8eea9bf02c0eebc6b281f7c73c552a279b379dbc75b385fe4b8d6d4"
REFRESH_TOKEN_SECRET="39d4c540e6b215e386a56b23818bd5bb99231acf913264527b8858242aac87882b333c6ce409c987a803e9f334535a487357cd930db74c55e1fea7920c736679"
```

**Step 3:** Update the insecure key:
```bash
# Find this line:
AIMLAPI_AI_API_KEY="dcc847936b14463cac35a898489fb72e"

# Replace with:
AIMLAPI_AI_API_KEY="cc6c3a7bff08e53af3c12adb5542241e8a023f17369ccb7c52b40fb04f9a3ce4"
```

**Step 4:** Save and restart
```bash
# Stop running servers (Ctrl+C in both terminals)
# Then restart:
npm run dev:all
```

---

### Option 2: Use Corrected File (Fastest)

```bash
# Backup current .env
cp .env .env.backup

# Use the corrected version
cp .env.corrected .env

# Restart servers
npm run dev:all
```

---

## ✅ Verification Steps

### 1. Check Backend Can Access Variables

```bash
# Run these commands to verify:
node -e "require('dotenv').config(); console.log('OPENWEATHER_API_KEY:', process.env.OPENWEATHER_API_KEY ? '✅ SET' : '❌ MISSING')"
node -e "require('dotenv').config(); console.log('AIMLAPI_AI_API_KEY:', process.env.AIMLAPI_AI_API_KEY ? '✅ SET' : '❌ MISSING')"
node -e "require('dotenv').config(); console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? '✅ SET' : '❌ MISSING')"
```

**Expected Output:**
```
OPENWEATHER_API_KEY: ✅ SET
AIMLAPI_AI_API_KEY: ✅ SET
ACCESS_TOKEN_SECRET: ✅ SET
```

### 2. Test Backend Starts Without Errors

```bash
npm run server
```

**Look for:**
```
✅ [INFO] Server is running on port 5000
✅ [INFO] Loaded irrigation routes
✅ [IRRIGATION] Routes initialized
```

**Should NOT see:**
```
❌ OPENWEATHER_API_KEY not configured
❌ Error loading routes
```

### 3. Test Frontend Loads Without Errors

```bash
npm run dev
```

**Open browser console (F12) and look for:**
```
✅ No errors about missing VITE_AIMLAPI_AI_API_KEY
✅ No errors about undefined environment variables
```

**Should NOT see:**
```
❌ VITE_AIMLAPI_AI_API_KEY is not configured
❌ Error: API key not found
```

### 4. Test Irrigation Service

```bash
# Test with curl (replace YOUR_API_KEY with your actual key)
curl -X POST http://localhost:5000/api/irrigation/recommend \
  -H "Content-Type: application/json" \
  -H "x-api-key: cc6c3a7bff08e53af3c12adb5542241e8a023f17369ccb7c52b40fb04f9a3ce4" \
  -d '{
    "location": {"lat": -1.286389, "lon": 36.817223},
    "cropType": "maize",
    "soilType": "loamy"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "recommendedWaterAmount": 6.5,
  "schedule": [
    {
      "date": "2025-10-23",
      "day": "Thursday",
      "waterAmount": 6.5,
      "duration": 78,
      "priority": "medium",
      ...
    }
  ],
  "recommendations": [...],
  "warnings": [...],
  "weatherSummary": {...}
}
```

**Should NOT see:**
```json
{
  "success": false,
  "message": "Weather service temporarily unavailable",
  "error": "OPENWEATHER_API_KEY not configured"
}
```

---

## 🎯 Quick Reference: Frontend vs Backend Variables

| Purpose | Frontend (Vite) | Backend (Node.js) |
|---------|-----------------|-------------------|
| OpenWeather API | `VITE_OPENWEATHER_API_KEY` ✅ | `OPENWEATHER_API_KEY` ❌ |
| Backend Auth | `VITE_AIMLAPI_AI_API_KEY` ❌ | `AIMLAPI_AI_API_KEY` ⚠️ |
| JWT Secrets | Not needed | `JWT_SECRET` ✅<br>`ACCESS_TOKEN_SECRET` ❌<br>`REFRESH_TOKEN_SECRET` ❌ |
| MongoDB | Not needed | `MONGODB_URL` ✅ |
| API Base URL | `VITE_API_BASE_URL` ✅ | Not needed |

**Key:** ✅ Present | ❌ Missing | ⚠️ Present but insecure

---

## 🔐 Why Duplicate Keys (VITE_ and without)?

**Vite (Frontend) Rule:**
- Only variables starting with `VITE_` are exposed to browser
- `import.meta.env.VITE_OPENWEATHER_API_KEY` works
- `import.meta.env.OPENWEATHER_API_KEY` returns `undefined`

**Node.js (Backend) Rule:**
- All variables in `.env` are available
- `process.env.OPENWEATHER_API_KEY` works
- `process.env.VITE_OPENWEATHER_API_KEY` also works (but not used)

**Example:**
```bash
# Both needed for full functionality:
OPENWEATHER_API_KEY="abc123"           # Backend uses this
VITE_OPENWEATHER_API_KEY="abc123"     # Frontend uses this
```

---

## 📞 Still Having Issues?

### Common Problems:

**Problem:** "Invalid or missing API key" (401 error)
**Solution:** Make sure `VITE_AIMLAPI_AI_API_KEY` matches `AIMLAPI_AI_API_KEY` exactly

**Problem:** "Weather service temporarily unavailable" (503 error)
**Solution:** Check `OPENWEATHER_API_KEY` is set (without VITE_ prefix) for backend

**Problem:** Environment variables not loading
**Solution:**
1. Restart both frontend and backend completely
2. Check `.env` file is in project root (same directory as `package.json`)
3. No spaces around `=` in .env file
4. No quotes inside quotes (use `KEY="value"` not `KEY=""value""`)

---

## ✅ Final Checklist

Before considering this fixed:

- [ ] Backed up original `.env` file
- [ ] Added `OPENWEATHER_API_KEY` (without VITE_)
- [ ] Added `VITE_AIMLAPI_AI_API_KEY`
- [ ] Updated `AIMLAPI_AI_API_KEY` to secure value
- [ ] Added `ACCESS_TOKEN_SECRET`
- [ ] Added `REFRESH_TOKEN_SECRET`
- [ ] Restarted backend server
- [ ] Restarted frontend dev server
- [ ] No console errors on startup
- [ ] Weather page loads data successfully
- [ ] Irrigation page generates recommendations
- [ ] Tested with curl command (returned real schedule)

---

**Last Updated:** 2025-10-22
**Severity:** 🔴 CRITICAL - Application cannot function without these fixes
