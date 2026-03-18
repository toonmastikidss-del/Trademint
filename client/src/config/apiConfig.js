

/**
 * API Configuration
 * 
 * IMPORTANT: MongoDB URI should NEVER be exposed on the client side.
 * All database operations must be performed through the backend API only.
 */

const API_CONFIG = {
  // Use environment variable with fallback for production
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://trademint-server-backend.onrender.com',
  
  // Client-side timeout settings
  TIMEOUT: 30000, // 30 seconds
  
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

