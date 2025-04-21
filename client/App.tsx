import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { theme } from './src/theme';
import { store } from './src/store';
import { loadAuth, updateUserData } from './src/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import api from './src/services/api';
import FlashMessage from 'react-native-flash-message';
import NetInfo from '@react-native-community/netinfo';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { ActivityIndicator, View, Text } from 'react-native';
import OfflineNotice from './src/components/OfflineNotice';
import cacheService from './src/services/cacheService';

// Define the auth stack navigator param list
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AppContent() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  
  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    // Only show loading on initial app start
    const initialize = async () => {
      await dispatch(loadAuth());
      setInitialLoading(false);
      
      // Check streak if logged in
      if (token) {
        try {
          // Try to get user data from cache first
          const cachedUser = await cacheService.getCachedUserData();
          
          if (isOnline) {
            // If online, check streak and update user data
            await api.post('/auth/check-streak');
            const response = await api.get('/auth/me');
            const userData = response.data;
            
            // Update Redux store
            dispatch({ type: 'auth/updateUserData/fulfilled', payload: userData });
            
            // Cache the updated user data
            if (userData) {
              await cacheService.cacheUserData(userData);
            }
          } else if (cachedUser) {
            // If offline but have cached data, use it
            dispatch({ type: 'auth/updateUserData/fulfilled', payload: cachedUser });
          }
        } catch (error) {
          console.error('Error during initialization:', error);
        }
      }
    };
    
    initialize();
  }, [dispatch, token, isOnline]);

  // Only show loading indicator on first app load
  // Not during registration/login attempts
  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <OfflineNotice />
      <Stack.Navigator
        initialRouteName={token ? "Main" : "Login"}
        screenOptions={{
          headerShown: false,
        }}>
        {token ? (
          <Stack.Screen name="Main" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <AppContent />
      </PaperProvider>
    </Provider>
  );
}
