import axios from 'axios';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Retry failed API requests with exponential backoff
 * @param {Function} requestFn - The axios request function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} - Response data
 */
export const retryRequest = async (requestFn, retries = API_CONFIG.MAX_RETRIES, delay = API_CONFIG.RETRY_DELAY) => {
  try {
    return await requestFn();
  } catch (error) {
    // Don't retry on 4xx errors (client errors)
    if (error.response && error.response.status >= 400 && error.response.status < 500) {
      throw error;
    }
    
    // No more retries left
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`⚠️ Request failed, retrying... (${API_CONFIG.MAX_RETRIES - retries + 1}/${API_CONFIG.MAX_RETRIES})`);
    
    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry with increasing delay
    return retryRequest(requestFn, retries - 1, delay * 2);
  }
};

/**
 * Make API request with automatic retry and better error handling
 * @param {string} url - API endpoint URL
 * @param {object} config - Axios config (headers, timeout, etc.)
 * @param {boolean} useRetry - Whether to use retry mechanism
 * @returns {Promise} - Response data
 */
export const apiRequest = async (url, config = {}, useRetry = true) => {
  const defaultConfig = {
    timeout: API_CONFIG.TIMEOUT,
    ...config
  };
  
  const makeRequest = async () => {
    const response = await axios.get(url, defaultConfig);
    return response.data;
  };
  
  if (useRetry) {
    return retryRequest(makeRequest);
  } else {
    return makeRequest();
  }
};

/**
 * POST request with retry mechanism
 */
export const postRequest = async (url, data = {}, config = {}, useRetry = true) => {
  const defaultConfig = {
    timeout: API_CONFIG.TIMEOUT,
    ...config
  };
  
  const makeRequest = async () => {
    const response = await axios.post(url, data, defaultConfig);
    return response.data;
  };
  
  if (useRetry) {
    return retryRequest(makeRequest);
  } else {
    return makeRequest();
  }
};
