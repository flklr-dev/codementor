import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { showMessage } from 'react-native-flash-message';

// Define your API base URL here
// Using the IP address your device can actually reach
const API_URL = 'http://192.168.1.118:4000/api';

// Create a base axios instance with timeout
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
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
    const errorMsg = error.response?.data?.error || error.message || 'An error occurred';
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