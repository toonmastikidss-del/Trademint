# 🚀 TradeMint Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Setup

#### Server (.env)
```bash
# CRITICAL: Change these before deploying!

# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trademint_db?appName=trademint

# JWT Secret - Generate a new one using:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_generated_secret_here_min_32_chars

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Origins - Add your production frontend URL
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

#### Client (client/.env.production)
```bash
REACT_APP_API_BASE_URL=https://your-backend-api.onrender.com
```

### 2. Security Updates

- [ ] Changed default JWT_SECRET to a secure random value (min 32 characters)
- [ ] Updated MongoDB password (if using shared credentials)
- [ ] Configured CORS with production URLs only
- [ ] Removed all hardcoded credentials from client-side code
- [ ] Enabled HTTPS on both frontend and backend
- [ ] Set up rate limiting (already configured in server.js)
- [ ] Added security headers with Helmet.js

### 3. Dependencies Installation

**Server:**
```bash
cd server
npm install
# New security packages added:
# - helmet@^7.1.0 (security headers)
# - express-rate-limit@^7.1.5 (rate limiting)
```

**Client:**
```bash
cd client
npm install
```

### 4. Build Process

**Client Build:**
```bash
cd client
npm run build
```

**Server Start:**
```bash
cd server
npm start
```

---

## 🔧 Common Issues & Solutions

### Issue 1: CORS Errors After Deployment

**Symptoms:** Frontend can't connect to backend, CORS policy errors in console

**Solution:**
1. Update `CORS_ORIGINS` in server `.env`:
   ```bash
   CORS_ORIGINS=https://your-frontend.onrender.com
   ```
2. Restart the backend server
3. Clear browser cache and test

---

### Issue 2: MongoDB Connection Failed

**Symptoms:** Server crashes on startup with connection error

**Solution:**
1. Verify MONGO_URI is correct in environment variables
2. Check MongoDB Atlas IP whitelist (allow access from anywhere: 0.0.0.0/0 for testing)
3. Ensure database user has correct permissions
4. Test connection string locally first

**Debug:**
```bash
# In server logs, look for:
✅ MongoDB Connected Successfully
# OR
❌ MongoDB Connection Error
```

---

### Issue 3: API Calls Fail in Production

**Symptoms:** Network errors, undefined API_BASE_URL

**Solution:**
1. Verify `REACT_APP_API_BASE_URL` is set in `client/.env.production`
2. Rebuild the client app after changing the URL
3. Clear CDN/cache if using one
4. Check browser DevTools Network tab for actual URLs being called

---

### Issue 4: Rate Limiting Too Strict

**Symptoms:** Users get "Too many requests" errors quickly

**Solution:**
Adjust rate limits in `server/server.js`:

```javascript
// Increase general API limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increase from 100 to 200
});

// Adjust auth limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increase from 20 to 50
});
```

---

### Issue 5: Admin Panel Not Accessible

**Symptoms:** Can't access /c/ routes, 404 errors

**Solution:**
1. Verify admin frontend is deployed separately on Render
2. Check that admin panel URL is added to CORS_ORIGINS
3. Ensure admin login creates proper localStorage items:
   - `isAdmin` = 'true'
   - `adminToken` = valid token

---

## 📊 Post-Deployment Verification

### 1. Backend Health Check

Visit: `https://your-backend-api.onrender.com/`
Expected: Cannot GET / (This is normal - API routes are under /api/)

Test endpoint: `https://your-backend-api.onrender.com/api/support`

### 2. Frontend Connection

1. Open browser DevTools → Network tab
2. Load your frontend app
3. Verify API calls are going to correct backend URL
4. Check response status codes (should be 200/201)

### 3. Authentication Flow

- [ ] User registration works
- [ ] User login works
- [ ] Token is stored in localStorage
- [ ] Protected routes require authentication
- [ ] Logout clears token properly

### 4. Core Features Testing

- [ ] Deposit submission works
- [ ] Withdrawal requests work
- [ ] KYC upload works
- [ ] Trading features work
- [ ] Balance updates correctly
- [ ] Admin panel accessible

---

## 🔐 Security Best Practices

### 1. Environment Variables

- ✅ Never commit .env files to Git
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets every 90 days
- ✅ Use environment variable management in Render

### 2. Database Security

- ✅ Use strong MongoDB passwords (20+ chars)
- ✅ Enable IP whitelist in MongoDB Atlas
- ✅ Create separate database users for different environments
- ✅ Regular backups enabled

### 3. API Security

- ✅ Rate limiting enabled (prevents DDoS)
- ✅ Helmet.js security headers active
- ✅ CORS properly configured
- ✅ JWT tokens expire (consider adding expiration)

### 4. Frontend Security

- ✅ No sensitive data in client-side code
- ✅ MongoDB URI removed from apiConfig.js
- ✅ All API calls use HTTPS
- ✅ Input validation on both client and server

---

## 📝 Monitoring & Maintenance

### Daily Checks

1. **Server Logs**: Monitor for errors in Render dashboard
2. **Database**: Check MongoDB Atlas for slow queries
3. **API Performance**: Watch response times
4. **Error Rates**: Track 4xx and 5xx errors

### Weekly Tasks

1. Review rate limit logs for abuse patterns
2. Check disk space usage (uploads folder)
3. Review failed login attempts
4. Monitor memory usage

### Monthly Maintenance

1. Update dependencies (`npm outdated`)
2. Rotate JWT secrets
3. Review and optimize slow database queries
4. Backup database
5. Security audit of new code

---

## 🆘 Emergency Procedures

### If Server Goes Down

1. Check Render dashboard for error messages
2. Verify MongoDB connection is working
3. Check environment variables are set
4. Review recent deployments for issues
5. Rollback to previous version if needed

### If Database Corrupted

1. Stop all write operations immediately
2. Restore from latest backup
3. Verify data integrity
4. Resume operations gradually

### If Security Breach Suspected

1. Rotate all secrets immediately (JWT, MongoDB passwords)
2. Review access logs
3. Check for unauthorized admin accounts
4. Audit recent deposits/withdrawals
5. Notify affected users if necessary

---

## 📞 Support Resources

### Documentation
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- React: https://react.dev/
- Render: https://render.com/docs

### Tools
- MongoDB Compass (database GUI)
- Postman (API testing)
- Chrome DevTools (debugging)

---

## ✨ Deployment Success Indicators

Your deployment is successful when:

- ✅ Server starts without errors
- ✅ MongoDB connects successfully
- ✅ Frontend can call backend APIs
- ✅ User authentication works
- ✅ All core features functional
- ✅ No CORS errors in console
- ✅ Rate limiting active (check headers)
- ✅ Security headers present (check response headers)

---

**Last Updated:** March 17, 2026  
**Version:** 1.0.0
