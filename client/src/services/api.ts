import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Handle 401 errors (unauthorized) - could redirect to login
    if (error.response && error.response.status === 401) {
      // Clear stored tokens
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to dispatch a logout action here or redirect
    }
    return Promise.reject(error);
  }
);

export default api;