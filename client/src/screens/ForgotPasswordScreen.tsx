import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
  Snackbar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { isValidEmail } from '../utils/validation';
import api from '../services/api';
import { AuthStackParamList } from '../navigation/AuthStack';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  
  const theme = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  useEffect(() => {
    if (emailSent) {
      const timer = setTimeout(() => {
        navigation.navigate('ResetPassword', { email });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [emailSent, email, navigation]);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!isValidEmail(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setIsLoading(false);
      setEmailSent(true);
    } catch (error: any) {
      setIsLoading(false);
      
      let message = 'An error occurred. Please try again.';
      
      // Check for network errors
      if (error.isNetworkError || 
          (error.message && (error.message.includes('Network Error') || 
                           error.message.includes('timeout') || 
                           error.message.includes('ECONNREFUSED')))) {
        message = 'Network error. Please check your internet connection and try again.';
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message = error.response.data.message || error.response.data.error || message;
      } else if (error.customMessage) {
        message = error.customMessage;
      }
      
      setErrorMessage(message);
      setShowErrorSnackbar(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {emailSent ? (
            <View style={styles.successContainer}>
              <Ionicons name="mail" size={60} color="#6366F1" />
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successText}>
                We've sent a password reset code to {email}. Please check your email and follow the instructions to reset your password.
              </Text>
              <Text style={styles.redirectingText}>
                Redirecting to the verification page...
              </Text>
              <ActivityIndicator size="small" color="#6366F1" style={styles.loader} />
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#6366F1" />
              </TouchableOpacity>
              
              <View style={styles.header}>
                <Image 
                  source={require('../../assets/app-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text variant="headlineMedium" style={styles.title}>
                  Forgot Password
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Enter your email to receive a password reset code
                </Text>
              </View>

              <View style={styles.form}>
                <View>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => validateEmail(email)}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                    error={!!emailError}
                    disabled={isLoading}
                  />
                  {emailError ? (
                    <HelperText type="error" visible={!!emailError}>
                      {emailError}
                    </HelperText>
                  ) : null}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  loading={isLoading}
                  disabled={isLoading}>
                  Send Reset Code
                </Button>

                <View style={styles.linkContainer}>
                  <Text variant="bodyMedium">Remember your password? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#6366F1',
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
  button: {
    marginTop: 16,
    height: 48,
  },
  buttonContent: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  errorSnackbar: {
    backgroundColor: '#EF4444',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  redirectingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  loader: {
    marginTop: 16,
  },
}); 