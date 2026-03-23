import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://trademint-server-backend.onrender.com';

let lastKnownBalance = null;
let lastKnownQuantify = null;

const getSavedUser = () => {
  try {
    const str = localStorage.getItem('user');
    if (!str || str === 'undefined' || str === 'null') return null;
    return JSON.parse(str);
  } catch (e) {
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Initialize balance detection with fresh server data
 */
export const initializeBalanceDetection = async () => {
  try {
    const token = localStorage.getItem('token');
    const savedUser = getSavedUser();

    if (!token || !savedUser) return;

    // ✅ FIX: Fresh server data fetch on init (stale localStorage use nahi hoga)
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const user = userResponse.data.user;
    lastKnownBalance = user.balance || 0;
    lastKnownQuantify = user.quantify || 0;

    console.log('🔍 Balance detection initialized (fresh from server):', {
      lastKnownBalance,
      lastKnownQuantify
    });
  } catch (error) {
    // Fallback to localStorage if server unreachable
    console.warn('⚠️ Server unreachable during init, falling back to localStorage');
    const savedUser = getSavedUser();
    if (savedUser) {
      lastKnownBalance = savedUser.balance || 0;
      lastKnownQuantify = savedUser.quantify || 0;
    }

    console.log('🔍 Balance detection initialized (from localStorage fallback):', {
      lastKnownBalance,
      lastKnownQuantify
    });
  }
};

/**
 * Check if balance has changed since last known value
 */
export const checkBalanceChange = async () => {
  try {
    const token = localStorage.getItem('token');
    const savedUser = getSavedUser();

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

      // ✅ FIX: Pehle old values alag variable mein save karo
      const oldBalance = lastKnownBalance;
      const oldQuantify = lastKnownQuantify;

      // ✅ Safe save — sirf valid object hi save karo
      if (user && typeof user === 'object') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // ✅ FIX: Dispatch event PEHLE karo, update BAAD mein — correct old values jayenge
      window.dispatchEvent(new CustomEvent('balance-updated', {
        detail: {
          oldBalance,           // ✅ Sahi purani value
          newBalance: currentBalance,
          oldQuantify,          // ✅ Sahi purani value
          newQuantify: currentQuantify,
          balanceChanged,
          quantifyChanged,
          user
        }
      }));

      // ✅ FIX: lastKnown values event dispatch ke BAAD update karo
      lastKnownBalance = currentBalance;
      lastKnownQuantify = currentQuantify;

      return {
        detected: true,
        oldBalance,             // ✅ Sahi purani value return hogi
        newBalance: currentBalance,
        oldQuantify,
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
    const savedUser = getSavedUser();

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

    console.log('✅ Manual refresh completed:', {
      balance: lastKnownBalance,
      quantify: lastKnownQuantify
    });

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