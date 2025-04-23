import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
  Snackbar,
  ProgressBar,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getPasswordStrength, getPasswordStrengthColor } from '../utils/validation';
import api from '../services/api';
import { AuthStackParamList } from '../navigation/AuthStack';

type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const route = useRoute<ResetPasswordScreenRouteProp>();
  const { email } = route.params;

  const [resetCode, setResetCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Validation states
  const [resetCodeError, setResetCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  
  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);
  
  const theme = useTheme();
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();

  // If user navigates back to this screen and reset was successful, redirect to login
  useEffect(() => {
    if (resetSuccess) {
      // Use a simple timeout to ensure state updates are complete
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, navigation]);

  const validateResetCode = (code: string) => {
    if (!code.trim()) {
      setResetCodeError('Reset code is required');
      return false;
    }
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setResetCodeError('Please enter a valid 6-digit code');
      return false;
    }
    setResetCodeError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleVerifyCode = async () => {
    if (!validateResetCode(resetCode)) {
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await api.post('/auth/verify-reset-code', { 
        email, 
        resetCode 
      });
      setIsVerifyingCode(false);
      setCodeVerified(true);
    } catch (error: any) {
      setIsVerifyingCode(false);
      
      let message = 'An error occurred. Please try again.';
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      setErrorMessage(message);
      setShowErrorSnackbar(true);
    }
  };

  const handleResetPassword = async () => {
    // Validate all fields
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword: password
      });
      
      setIsResettingPassword(false);
      setResetSuccess(true);
      
      // We don't need the navigation timeout here since it's handled in the useEffect
      // This prevents potential double navigation
    } catch (error: any) {
      setIsResettingPassword(false);
      
      let message = 'An error occurred. Please try again.';
      if (error.response) {
        message = error.response.data.message || message;
      }
      
      setErrorMessage(message);
      setShowErrorSnackbar(true);
    }
  };

  const handleResendCode = async () => {
    try {
      await api.post('/auth/forgot-password', { email });
      setErrorMessage('A new code has been sent to your email');
      setShowErrorSnackbar(true);
    } catch (error: any) {
      let message = 'Failed to resend code. Please try again.';
      if (error.response) {
        message = error.response.data.message || message;
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
          {resetSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
              <Text style={styles.successTitle}>Password Reset Successful!</Text>
              <Text style={styles.successText}>
                Your password has been reset successfully. You can now log in with your new password.
              </Text>
              <ProgressBar
                progress={1}
                color="#22C55E"
                style={styles.progressBar}
              />
              <Text style={styles.redirectingText}>
                Redirecting to login...
              </Text>
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
                  Reset Password
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  {codeVerified
                    ? 'Create a new password for your account'
                    : 'Enter the 6-digit code sent to your email'}
                </Text>
                <Text variant="bodyMedium" style={styles.emailText}>
                  {email}
                </Text>
              </View>

              <View style={styles.form}>
                {!codeVerified ? (
                  <>
                    <View>
                      <TextInput
                        label="Reset Code"
                        value={resetCode}
                        onChangeText={(text) => {
                          // Only allow numbers and limit to 6 characters
                          const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 6);
                          setResetCode(cleanedText);
                        }}
                        mode="outlined"
                        keyboardType="number-pad"
                        style={styles.input}
                        maxLength={6}
                        left={<TextInput.Icon icon="key" />}
                        error={!!resetCodeError}
                        disabled={isVerifyingCode}
                      />
                      {resetCodeError ? (
                        <HelperText type="error" visible={!!resetCodeError}>
                          {resetCodeError}
                        </HelperText>
                      ) : null}
                    </View>

                    <Button
                      mode="contained"
                      onPress={handleVerifyCode}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                      loading={isVerifyingCode}
                      disabled={isVerifyingCode}>
                      Verify Code
                    </Button>

                    <TouchableOpacity 
                      style={styles.resendLink}
                      onPress={handleResendCode}
                      disabled={isVerifyingCode}
                    >
                      <Text style={{ color: '#6366F1' }}>
                        Didn't receive a code? Resend code
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View>
                      <TextInput
                        label="New Password"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (confirmPassword) {
                            validateConfirmPassword(confirmPassword);
                          }
                        }}
                        onBlur={() => validatePassword(password)}
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
                        error={!!passwordError}
                        disabled={isResettingPassword}
                      />
                      {passwordError ? (
                        <HelperText type="error" visible={!!passwordError}>
                          {passwordError}
                        </HelperText>
                      ) : password ? (
                        <View style={styles.passwordStrength}>
                          <Text style={{ fontSize: 12 }}>Password strength: </Text>
                          <Text style={[styles.strengthText, { color: passwordStrengthColor }]}>
                            {passwordStrength.toUpperCase()}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View>
                      <TextInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onBlur={() => validateConfirmPassword(confirmPassword)}
                        mode="outlined"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        left={<TextInput.Icon icon="lock-check" />}
                        error={!!confirmPasswordError}
                        disabled={isResettingPassword}
                      />
                      {confirmPasswordError ? (
                        <HelperText type="error" visible={!!confirmPasswordError}>
                          {confirmPasswordError}
                        </HelperText>
                      ) : null}
                    </View>

                    <Button
                      mode="contained"
                      onPress={handleResetPassword}
                      style={[styles.button, styles.resetButton]}
                      contentStyle={styles.buttonContent}
                      loading={isResettingPassword}
                      disabled={isResettingPassword}>
                      Reset Password
                    </Button>
                  </>
                )}
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
        style={errorMessage.includes('sent') ? styles.successSnackbar : styles.errorSnackbar}>
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
  emailText: {
    fontSize: 14,
    marginTop: 8,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
    height: 48,
  },
  button: {
    marginTop: 4,
    height: 48,
  },
  resetButton: {
    marginTop: 12,
  },
  buttonContent: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  strengthText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  errorSnackbar: {
    backgroundColor: '#EF4444',
  },
  successSnackbar: {
    backgroundColor: '#10B981',
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
    color: '#22C55E',
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
  progressBar: {
    height: 4,
    width: '80%',
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  redirectingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
}); 