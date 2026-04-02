import { API_CONFIG } from '../config/apiConfig';

/**
 * Keep Render backend awake by pinging health check endpoint periodically
 * This prevents Render free tier from sleeping the server
 */
export const keepBackendAlive = () => {
  // Only run in production with Render backend
  const isRenderBackend = 
    process.env.REACT_APP_API_BASE_URL?.includes('onrender.com') ||
    window.location.hostname !== 'localhost';
  
  if (!isRenderBackend) {
    console.log('ℹ️ Local backend detected - skipping wake-up pings');
    return;
  }
  
  console.log('🔔 Starting Render wake-up ping service...');
  
  // Ping every 10 minutes (before Render's 15-minute sleep timeout)
  const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
  
  const sendPing = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quantify/time`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        console.log('✅ Wake-up ping successful - backend is awake');
      } else {
        console.warn('⚠️ Wake-up ping returned non-OK status:', response.status);
      }
    } catch (error) {
      // Silent fail - don't spam console during development
      // console.warn('❌ Wake-up ping failed:', error.message);
    }
  };
  
  // Send initial ping immediately
  sendPing();
  
  // Schedule recurring pings
  setInterval(sendPing, PING_INTERVAL);
  
  // Also ping on visibility change (when user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ Tab became visible - sending wake-up ping');
      sendPing();
    }
  });
};

/**
 * Check backend health and connection status
 * @returns {Promise<{isHealthy: boolean, responseTime: number|null, error: string|null}>}
 */
export const checkBackendHealth = async () => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/quantify/time`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        isHealthy: true,
        responseTime,
        error: null,
        serverTime: data.serverTime
      };
    } else {
      return {
        isHealthy: false,
        responseTime,
        error: `Server returned ${response.status}`,
        serverTime: null
      };
    }
  } catch (error) {
    return {
      isHealthy: false,
      responseTime: null,
      error: error.message || 'Connection failed',
      serverTime: null
    };
  }
};
