import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Divider,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../store/slices/authSlice';

type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Add states for error handling with snackbar instead of Alert
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  
  // Add state for login success
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Button loading state
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  
  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const dispatch = useAppDispatch();
  const { error, token, user } = useAppSelector(state => state.auth);

  // Effect to navigate on successful login after showing success message
  useEffect(() => {
    if (token && user) {
      setIsButtonLoading(false);
      setLoginSuccess(true);
      
      // Navigate after showing success message for a short time
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1500); // Show success message for 1.5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [token, user, navigation]);

  // Effect to handle errors with snackbar instead of Alert
  useEffect(() => {
    if (error) {
      setErrorMessage(`Login Error: ${error}`);
      setShowErrorSnackbar(true);
      setIsButtonLoading(false);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill all fields');
      setShowErrorSnackbar(true);
      return;
    }
    
    setIsButtonLoading(true);
    dispatch(loginUser({ email, password }));
  };

  const handleGoogleLogin = async () => {
    // Implement OAuth login
    setErrorMessage('Google login not implemented yet');
    setShowErrorSnackbar(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        
        {!loginSuccess ? (
          <>
            <View style={styles.header}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
              <Text variant="titleLarge" style={styles.title}>
                Welcome Back
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Login to continue your coding journey
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => console.log('Forgot password')}>
                <Text style={{ color: theme.colors.primary }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                contentStyle={styles.buttonContent}
                loading={isButtonLoading}
                disabled={isButtonLoading}>
                Login
              </Button>

              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                <Divider style={styles.divider} />
              </View>

              <Button
                mode="outlined"
                icon="google"
                onPress={handleGoogleLogin}
                style={styles.googleButton}
                contentStyle={styles.buttonContent}>
                Google
              </Button>

              <View style={styles.linkContainer}>
                <Text variant="bodyMedium">Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
            <Text style={styles.successTitle}>Login Successful!</Text>
            <Text style={styles.successText}>
              Welcome back{user?.name ? `, ${user.name}` : ''}! Redirecting you to your dashboard...
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
      
      {/* Error Snackbar */}
      <Snackbar
        visible={showErrorSnackbar}
        onDismiss={() => setShowErrorSnackbar(false)}
        duration={3000}
        style={styles.errorSnackbar}>
        {errorMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
    height: 48,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  button: {
    marginTop: 4,
    height: 48,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontSize: 12,
  },
  googleButton: {
    borderColor: '#E5E7EB',
    height: 48,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonContent: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  errorSnackbar: {
    backgroundColor: '#EF4444',
  },
  // Add these new styles for the success message
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    flex: 1,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
}); 