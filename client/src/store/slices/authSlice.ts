import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import axios from 'axios';

// Add this interface definition before your authSlice
interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Define state interface
interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean; // Add this to track registration vs login
  isRegistrationSuccess: boolean;
}

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isRegistered: false,
  isRegistrationSuccess: false,
};

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Registration failed');
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token and user data
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Login failed'
      );
    }
  }
);

export const loadAuth = createAsyncThunk(
  'auth/load',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      
      if (token && user) {
        return { token, user };
      }
      return { token: null, user: null };
    } catch (error: any) {
      return rejectWithValue('Failed to load auth state');
    }
  }
);

export const updateUserData = createAsyncThunk(
  'auth/updateUserData',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.message || 
        'Failed to update user data'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isRegistered = false;
      // Clear storage on logout
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    },
    clearRegistrationStatus: (state) => {
      state.isRegistrationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.error = null;
        state.isRegistrationSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isRegistrationSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isRegistrationSuccess = false;
      });
    
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });
    
    // Load auth cases
    builder
      .addCase(loadAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loadAuth.rejected, (state) => {
        state.isLoading = false;
      });

    // Update user data cases
    builder
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, logout, clearRegistrationStatus } = authSlice.actions;
export default authSlice.reducer; 