import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { showMessage } from 'react-native-flash-message';
import NetInfo from '@react-native-community/netinfo';

// Define your API base URL here
// Using the IP address your device can actually reach
const API_URL = 'http://192.168.1.118:4000/api';

// Create a base axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased to 15 seconds timeout for slower connections
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    // First check internet connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      // Return early with a custom error if no internet
      return Promise.reject({
        isNetworkError: true,
        message: 'No internet connection. Please check your connection and try again.',
      });
    }

    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for network errors
    if (error.isNetworkError) {
      showMessage({
        message: 'Network Error',
        description: error.message || 'Unable to connect to the server. Please check your internet connection.',
        type: 'danger',
        duration: 5000,
      });
      return Promise.reject(error);
    }

    // Handle axios network errors
    if (error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('timeout') || 
        error.message.includes('connect ECONNREFUSED')
      )) {
      showMessage({
        message: 'Server Connection Error',
        description: 'Unable to reach the server. Please check your internet connection or try again later.',
        type: 'danger',
        duration: 5000,
      });
      return Promise.reject({
        ...error,
        customMessage: 'Server connection error. Please try again later.'
      });
    }

    // Handle 401 errors (unauthorized) - could redirect to login
    if (error.response && error.response.status === 401) {
      const errorCode = error.response.data?.code;
      const errorMessage = error.response.data?.error || 'Authentication failed';

      // Check for specific JWT error codes
      if (['TOKEN_EXPIRED', 'INVALID_TOKEN', 'AUTH_REQUIRED', 'USER_NOT_FOUND'].includes(errorCode)) {
        // Clear stored tokens and user data
        await AsyncStorage.multiRemove(['token', 'userData']);
        
        // Dispatch logout action to clear Redux state
        store.dispatch(logout());

        // Show error message to user
        showMessage({
          message: 'Session Expired',
          description: 'Please log in again to continue.',
          type: 'warning',
          duration: 5000,
        });

        // Prevent infinite retry loop
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          return Promise.reject(error);
        }
      }
    }

    // Handle other errors
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    showMessage({
      message: 'Error',
      description: errorMsg,
      type: 'danger',
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;