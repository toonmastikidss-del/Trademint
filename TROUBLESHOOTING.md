# 🔧 TradeMint Backend Connection Issues - Troubleshooting Guide

## ❌ Error: "Server returned invalid JSON: Offline - Please check your connection"

### Root Causes Identified:

1. **Render Free Tier Sleep Mode** ⚠️
   - Render servers sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up
   - This causes timeout errors and "invalid JSON" messages

2. **Missing Error Handlers on Backend** ✅ FIXED
   - Added 404 handler (returns JSON instead of HTML)
   - Added global error handler (always returns JSON)
   - Better error logging for debugging

3. **No Retry Mechanism** ✅ FIXED
   - Added automatic retry with exponential backoff
   - Increased timeout from 30s to 60s (for Render wake-up delay)
   - Better error recovery with fallback data

---

## 🛠️ Solutions Implemented:

### Backend Changes (`server/server.js`):
```javascript
// ✅ 404 HANDLER - Return JSON for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    status: 404
  });
});

// ✅ GLOBAL ERROR HANDLER - Always return JSON
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err.message);
  res.status(err.status || 500).json({
    error: err.name === 'ValidationError' ? 'Validation Error' : 'Internal Server Error',
    message: err.message || 'Something went wrong',
    status: err.status || 500
  });
});
```

### Frontend Changes:

#### 1. Increased Timeout & Added Retries (`apiConfig.js`):
```javascript
TIMEOUT: 60000, // 60 seconds (was 30s)
MAX_RETRIES: 3,
RETRY_DELAY: 2000 // 2 seconds between retries
```

#### 2. Automatic Retry Utility (`apiUtils.js`):
- Retries failed requests up to 3 times
- Exponential backoff (2s, 4s, 8s delays)
- Skips retry on 4xx errors (client errors)

#### 3. Backend Keep-Alive Service (`backendKeepAlive.js`):
- Pings backend every 10 minutes (before Render's 15-min sleep)
- Sends wake-up ping when user opens/returns to tab
- Prevents Render from putting server to sleep

#### 4. Mine Component Enhanced Error Handling:
- Better error logging in console
- Graceful fallback to cached data
- Timeout handling on all API calls

---

## 🚀 How to Test:

### 1. **Check Backend Status:**
Open browser console and run:
```javascript
import { checkBackendHealth } from './utils/backendKeepAlive';
checkBackendHealth().then(console.log);
```

Expected output:
```javascript
{
  isHealthy: true,
  responseTime: 234, // ms
  error: null,
  serverTime: "2026-04-02T..."
}
```

### 2. **Test Wake-up Ping:**
If backend is sleeping, first request will be slow (~30-60s), subsequent requests fast (<1s).

Watch console logs for:
```
🔔 Starting Render wake-up ping service...
✅ Wake-up ping successful - backend is awake
```

### 3. **Monitor API Calls:**
Open DevTools → Network tab → Filter by "quantify"
- Check if requests are succeeding (status 200)
- Look for retry attempts in console
- Verify JSON responses (not HTML)

---

## 🐛 Debug Steps:

### Step 1: Check Console Logs
Open browser DevTools (F12) → Console tab

Look for these error patterns:
- `❌ User API Error:` - Authentication endpoint failing
- `❌ Error fetching user data:` - General API failure
- `⚠️ Request failed, retrying...` - Retry mechanism active
- `Network Error` or `ERR_CONNECTION_TIMED_OUT` - Backend is down/sleeping

### Step 2: Check Network Tab
DevTools → Network tab → Reload page

Filter by "api" and look for:
- ❌ Red requests (failed) - Click to see error
- ⏳ Pending > 30s - Backend is waking up
- ✅ Green 200 OK - Success!

### Step 3: Test Backend Directly
Open new tab and visit:
```
https://trademint-server-backend.onrender.com/api/quantify/time
```

Expected response (JSON):
```json
{
  "serverTime": "2026-04-02T...",
  "timestamp": 1234567890
}
```

If you see HTML/error page → Backend is down or returning errors.

### Step 4: Check Render Logs
Visit: https://dashboard.render.com/
→ Your app → Logs tab

Look for:
- `Server running on port 5000` ✅
- `MongoDB Connected Successfully` ✅
- `❌ MongoDB Connection Error` ❌
- `Error: Cannot find module` ❌

---

## 💡 Quick Fixes:

### If Backend is Sleeping:
1. Visit: https://trademint-server-backend.onrender.com/api/quantify/time
2. Wait 30-60 seconds for wake-up
3. Refresh your app

### If Backend is Down/Crashed:
1. Check Render dashboard for errors
2. Restart the server from Render dashboard
3. Check MongoDB Atlas connection

### If Still Getting Errors:
1. Clear browser cache & localStorage:
```javascript
localStorage.clear();
location.reload();
```

2. Check `.env` file:
```
REACT_APP_API_BASE_URL=https://trademint-server-backend.onrender.com
```

3. Rebuild frontend:
```bash
npm run build
```

---

## 📊 Expected Behavior After Fix:

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| Backend sleeping | ❌ Error: Invalid JSON | ⏳ Waits 60s, then succeeds |
| 404 route | ❌ HTML error page | ✅ JSON error response |
| Network timeout | ❌ App crashes | ✅ Retries 3 times |
| Server error | ❌ White screen | ✅ Shows static data + error log |
| Backend wake-up | ❌ Times out | ✅ Auto-retries after wake-up |

---

## 🎯 What Changed in Code:

### Files Modified:
1. ✅ `server/server.js` - Added 404 & error handlers
2. ✅ `client/src/components/mine.js` - Enhanced error handling & logging
3. ✅ `client/src/config/apiConfig.js` - Increased timeout, added retry config
4. ✅ `client/src/App.js` - Integrated keep-alive service

### Files Created:
1. ✅ `client/src/utils/apiUtils.js` - Retry utility functions
2. ✅ `client/src/utils/backendKeepAlive.js` - Wake-up ping service

---

## 🔍 Common Error Messages & Solutions:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Server returned invalid JSON` | Backend returning HTML instead of JSON | ✅ Fixed with error handlers |
| `Offline - Please check your connection` | Backend unreachable/timed out | ✅ Fixed with retries & longer timeout |
| `Network Error` | CORS or connection refused | Check CORS_ORIGINS in backend .env |
| `ERR_CONNECTION_TIMED_OUT` | Backend is sleeping | ⏳ Wait 30-60s or use keep-alive |
| `Failed to fetch` | Same as above | Check network tab for details |

---

## 📞 Support Checklist:

If problem persists, provide these details:
- [ ] Browser console errors (screenshot)
- [ ] Network tab request/response (screenshot)
- [ ] Backend URL from `.env` file
- [ ] Is backend showing as "Running" in Render dashboard?
- [ ] Can you access `/api/quantify/time` directly in browser?

---

## 🎉 Success Indicators:

You'll know it's working when you see:
```
✅ Wake-up ping successful - backend is awake
📊 Fetched quantify data successfully
```

And in Network tab:
- All `/api/*` requests show status 200 (green)
- Response type: "application/json"
- No red failed requests

---

**Last Updated:** April 2, 2026  
**Status:** ✅ All fixes implemented and tested
