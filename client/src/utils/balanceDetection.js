/**
 * Balance Change Detection System
 * Detects deposits and withdrawals in real-time across all pages
 * Similar to Quantify page's balance change detection
 */

import axios from 'axios';

// Use environment variable or fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://trademint-server-backend.onrender.com';

// Store last known balance to detect changes
let lastKnownBalance = null;
let lastKnownQuantify = null;

// ✅ Safe localStorage parser — har jagah yahi use karo
const getSavedUser = () => {
  try {
    const str = localStorage.getItem('user');
    if (!str || str === 'undefined' || str === 'null') return null;
    return JSON.parse(str);
  } catch (e) {
    localStorage.removeItem('user'); // corrupt data clear karo
    return null;
  }
};

/**
 * Initialize balance change detection
 * Call this once when app starts
 */
export const initializeBalanceDetection = () => {
  // Load initial balance
  const savedUser = getSavedUser(); // ✅ Fixed
  if (savedUser) {
    lastKnownBalance = savedUser.balance || 0;
    lastKnownQuantify = savedUser.quantify || 0;
  }
  
  console.log('🔍 Balance detection initialized:', { 
    lastKnownBalance, 
    lastKnownQuantify 
  });
};

/**
 * Check for balance changes and update if needed
 * Call this periodically or after transactions
 */
export const checkBalanceChange = async () => {
  try {
    const token = localStorage.getItem('token');
    const savedUser = getSavedUser(); // ✅ Fixed
    
    if (!token || !savedUser) {
      return { detected: false };
    }
    
    // Fetch fresh user data
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = userResponse.data.user;
    const currentBalance = user.balance || 0;
    const currentQuantify = user.quantify || 0;
    
    // Check if balance changed
    const balanceChanged = currentBalance !== lastKnownBalance;
    const quantifyChanged = currentQuantify !== lastKnownQuantify;
    
    if (balanceChanged || quantifyChanged) {
      console.log('💰 BALANCE CHANGE DETECTED!');
      console.log('Old Balance:', lastKnownBalance);
      console.log('New Balance:', currentBalance);
      console.log('Difference:', (currentBalance - (lastKnownBalance || 0)).toFixed(2));
      
      if (quantifyChanged) {
        console.log('Old Quantify:', lastKnownQuantify);
        console.log('New Quantify:', currentQuantify);
      }
      
      // ✅ Safe save — sirf valid object hi save karo
      if (user && typeof user === 'object') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('balance-updated', {
        detail: {
          oldBalance: lastKnownBalance,
          newBalance: currentBalance,
          oldQuantify: lastKnownQuantify,
          newQuantify: currentQuantify,
          balanceChanged,
          quantifyChanged,
          user
        }
      }));
      
      // Update last known values
      lastKnownBalance = currentBalance;
      lastKnownQuantify = currentQuantify;
      
      return {
        detected: true,
        oldBalance: lastKnownBalance,
        newBalance: currentBalance,
        oldQuantify: lastKnownQuantify,
        newQuantify: currentQuantify
      };
    }
    
    return { detected: false };
  } catch (error) {
    console.error('❌ Error checking balance change:', error);
    return { detected: false, error };
  }
};

/**
 * Force refresh user data (manual refresh)
 */
export const forceRefreshUserData = async () => {
  try {
    const token = localStorage.getItem('token');
    const savedUser = getSavedUser(); // ✅ Fixed
    
    if (!token || !savedUser) {
      return null;
    }
    
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = userResponse.data.user;

    // ✅ Safe save
    if (user && typeof user === 'object') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    // Update last known values without triggering change event
    lastKnownBalance = user.balance || 0;
    lastKnownQuantify = user.quantify || 0;
    
    console.log('✅ Manual refresh completed');
    return user;
  } catch (error) {
    console.error('❌ Error refreshing user data:', error);
    return null;
  }
};

/**
 * Listen for balance updates from other tabs/windows
 */
export const enableCrossTabSync = () => {
  window.addEventListener('storage', (event) => {
    if (event.key === 'user') {
      console.log('🔄 Cross-tab balance sync detected');
      checkBalanceChange();
    }
  });
};