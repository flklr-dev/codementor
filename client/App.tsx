import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { theme } from './src/theme';
import { store } from './src/store';
import { loadAuth, updateUserData } from './src/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from './src/store/hooks';
import api from './src/services/api';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

function AppContent() {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector(state => state.auth);
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    // Only show loading on initial app start
    const initialize = async () => {
      await dispatch(loadAuth());
      setInitialLoading(false);
      
      // Check streak if logged in
      if (token) {
        try {
          await api.post('/auth/check-streak');
          // Refresh user data to get updated streak
          await dispatch(updateUserData());
        } catch (error) {
          console.error('Error checking streak:', error);
        }
      }
    };
    
    initialize();
  }, [dispatch, token]);

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
