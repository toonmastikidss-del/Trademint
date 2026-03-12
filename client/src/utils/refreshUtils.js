/**
 * Utility function to refresh user data ONCE after deposit/withdrawal
 * This prevents continuous auto-updates that increase server load
 */

export const refreshUserDataOnce = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    
    if (!savedUser || !token) {
      console.warn('No user or token found for refresh');
      return;
    }

    // Fetch fresh user data from server
    const userResponse = await axios.get('http://localhost:5000/api/auth/user', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = userResponse.data.user;
    
    // Update localStorage with new data
    localStorage.setItem('user', JSON.stringify(user));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('user-data-updated', { 
      detail: { user } 
    }));
    
    console.log('✅ User data refreshed successfully');
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
