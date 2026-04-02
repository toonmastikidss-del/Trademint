
const API_CONFIG = {
  // Use environment variable with fallback for production
  // BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://trademint-server-backend.onrender.com', For Render
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://trademint-backend-production.up.railway.app',
  
  // Client-side timeout settings
  TIMEOUT: 60000, // 60 seconds (increased for Render wake-up delay)
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds between retries
  
  // API endpoints (relative paths - will be appended to BASE_URL)
  ENDPOINTS: {
    AUTH: '/api/auth',
    SUPPORT: '/api/support',
    ADMIN: '/api/admin',
    BANK: '/api/bank',
    DEPOSIT: '/api/deposit',
    QUANTIFY: '/api/quantify',
    QR: '/api/qr',
    WITHDRAWAL: '/api/withdrawal',
    TASK: '/api/task',
    KYC: '/api/kyc',
    REFERRAL: '/api/referral',
    GAME: '/api/game'
  }
};

export { API_CONFIG };

