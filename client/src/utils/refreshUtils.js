/**
 * Utility function to refresh user data ONCE after deposit/withdrawal
 * This prevents continuous auto-updates that increase server load
 */

import axios from 'axios';

// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://trademint-server-backend.onrender.com';

export const refreshUserDataOnce = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      console.warn('No user or token found for refresh');
      return;
    }

    // Fetch fresh user data from server
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = userResponse.data.user;
    
    // Update localStorage with new data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('user-data-updated', { 
      detail: { user } 
    }));
    
    // console.log('✅ User data refreshed successfully');
    return user;
  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    throw error;
  }
};

/**
 * Auto-refresh page ONCE after successful transaction
 * @param {number} delayMs - Delay in milliseconds (default: 5000ms = 5 seconds)
 */
export const autoRefreshOnce = (delayMs = 5000) => {
  setTimeout(() => {
    window.location.reload();
  }, delayMs);
};
