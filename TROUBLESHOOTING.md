# Troubleshooting Guide - Record.js

## ✅ Fixed Issues:

### 1. CORS Configuration
**Problem:** Server only allowed `http://localhost:3000`
**Solution:** Updated to allow both ports:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

### 2. Base URL Centralization
**Problem:** Hardcoded URLs throughout the code
**Solution:** Using `API_CONFIG.BASE_URL` from centralized config

---

## 🔍 Common Issues & Solutions:

### Issue 1: "Access to fetch blocked by CORS policy"
**Check:**
1. Server is running on port 5000
2. Frontend is running on port 3000 or 5173
3. CORS settings in `server/server.js` include your frontend port

**Fix:**
```javascript
// In server/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Issue 2: "Cannot read property '_id' of null"
**Cause:** localStorage data is missing or corrupted

**Check Browser Console:**
```javascript
// Check if user data exists
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('token'));
```

**Fix:**
1. Clear browser cache and localStorage
2. Login again
3. Check if user object has `_id` field

---

### Issue 3: "Failed to fetch" / Network Error
**Possible Causes:**
1. ❌ Backend server not running
2. ❌ Wrong BASE_URL in config
3. ❌ MongoDB connection issue

**Debug Steps:**
```bash
# Check if server is running
netstat -ano | findstr :5000

# Check MongoDB connection
# Look for "MongoDB Connected" in server logs
```

**Quick Fix:**
```powershell
# Restart backend
cd c:\Users\Gautam\Desktop\trademint\trademint\Trademint-main\server
npm start

# Restart frontend
cd c:\Users\Gautam\Desktop\trademint\trademint\Trademint-main\client
npm start
```

---

### Issue 4: "No records found" but data exists in DB
**Check:**
1. API is returning data (check Network tab in DevTools)
2. User ID is correct
3. Token is valid

**Debug:**
Open browser DevTools → Network tab → Filter by "api"
Check if requests are successful (status 200)

---

## 🛠️ Testing Checklist:

### Before Testing Record Page:
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000/5173
- [ ] MongoDB Atlas connected (check server logs)
- [ ] User is logged in (token exists in localStorage)

### Browser Console Checks:
```javascript
// Should NOT be null
localStorage.getItem('token')
localStorage.getItem('user')

// User object should have _id
JSON.parse(localStorage.getItem('user'))._id
```

---

## 📝 Current Configuration:

### Backend (server/.env):
```
MONGO_URI=mongodb+srv://toonmastikidss_db_user:h1ZWbzCU5gTT7YPz@cluster0.pmlkhby.mongodb.net/?appName=Cluster0
PORT=5000
```

### Frontend (client/src/config/apiConfig.js):
```javascript
BASE_URL: 'http://localhost:5000'
```

### CORS Allowed Origins:
```javascript
['http://localhost:3000', 'http://localhost:5173']
```

---

## 🚀 Quick Start Commands:

### Terminal 1 - Backend:
```powershell
cd c:\Users\Gautam\Desktop\trademint\trademint\Trademint-main\server
npm start
```

### Terminal 2 - Frontend:
```powershell
cd c:\Users\Gautam\Desktop\trademint\trademint\Trademint-main\client
npm start
```

---

## ⚠️ If Still Having Issues:

1. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Reload page

2. **Re-login:**
   - Logout from the app
   - Clear localStorage: `localStorage.clear()`
   - Login again

3. **Check Server Logs:**
   - Look for errors in backend terminal
   - Check MongoDB connection status

4. **Verify Database:**
   - MongoDB Atlas cluster is active
   - Internet connection is stable
