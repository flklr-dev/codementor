import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Divider,
  HelperText,
  Snackbar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError, clearRegistrationStatus } from '../store/slices/authSlice';
import { isValidEmail, getPasswordStrength, getPasswordStrengthColor } from '../utils/validation';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Field touched states
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  
  // Success dialog state
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  
  // Add states for error handling
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  
  // Add a state to track registration success
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Add this state to track button loading only
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.auth);

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);

  // Validate fields
  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Name is required');
      return false;
    }
    setNameError('');
    return true;
  };

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

  // Custom error handler
  const handleRegistrationError = (error: string) => {
    // Detect specific error types for better messaging
    if (error.includes('email') && error.includes('already')) {
      setErrorMessage('This email is already registered. Please use a different email or try logging in.');
    } else if (error.includes('password')) {
      setErrorMessage('Password error: ' + error);
    } else {
      setErrorMessage('Registration failed: ' + error);
    }
    setShowErrorSnackbar(true);
  };

  // Show success dialog and prepare to navigate to login
  const showSuccessAndNavigate = () => {
    setSuccessDialogVisible(true);
    // Clear form data
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    // Reset touched states
    setNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    // Clear the registration status so we don't show the dialog again if user comes back
    dispatch(clearRegistrationStatus());
  };

  // Effect to show success dialog on successful registration
  useEffect(() => {
    if (registrationSuccess) {
      showSuccessAndNavigate();
    }
  }, [registrationSuccess]);

  // Effect to handle errors
  useEffect(() => {
    if (error) {
      setErrorMessage(`Registration Error: ${error}`);
      setShowErrorSnackbar(true);
      setIsButtonLoading(false);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleBlur = (field: string) => {
    switch (field) {
      case 'name':
        setNameTouched(true);
        validateName(name);
        break;
      case 'email':
        setEmailTouched(true);
        validateEmail(email);
        break;
      case 'password':
        setPasswordTouched(true);
        validatePassword(password);
        break;
      case 'confirmPassword':
        setConfirmPasswordTouched(true);
        validateConfirmPassword(confirmPassword);
        break;
    }
  };

  const handleSignup = async () => {
    // Validate all fields
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    // Set all fields as touched
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
      try {
        setIsButtonLoading(true);
        await dispatch(registerUser({ name, email, password })).unwrap();
        setIsButtonLoading(false);
        setRegistrationSuccess(true);
      } catch (err) {
        setIsButtonLoading(false);
        console.log('Registration error:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {!registrationSuccess ? (
            <>
              <View style={styles.header}>
                <Image 
                  source={require('../../assets/app-logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Sign up to start learning and improving your coding skills
                </Text>
              </View>

              <View style={styles.form}>
                <View>
                  <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    onBlur={() => handleBlur('name')}
                    mode="outlined"
                    style={styles.input}
                    left={<TextInput.Icon icon="account" />}
                    error={nameTouched && !!nameError}
                  />
                  {nameTouched && nameError ? (
                    <HelperText type="error" visible={!!nameError}>
                      {nameError}
                    </HelperText>
                  ) : null}
                </View>

                <View>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => handleBlur('email')}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    left={<TextInput.Icon icon="email" />}
                    error={emailTouched && !!emailError}
                  />
                  {emailTouched && emailError ? (
                    <HelperText type="error" visible={!!emailError}>
                      {emailError}
                    </HelperText>
                  ) : null}
                </View>

                <View>
                  <TextInput
                    label="Password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      // Real-time validation for confirm password when password changes
                      if (confirmPasswordTouched && confirmPassword) {
                        validateConfirmPassword(confirmPassword);
                      }
                    }}
                    onBlur={() => handleBlur('password')}
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
                    error={passwordTouched && !!passwordError}
                  />
                  {passwordTouched && passwordError ? (
                    <HelperText type="error" visible={!!passwordError}>
                      {passwordError}
                    </HelperText>
                  ) : passwordTouched && password ? (
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
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      // Real-time validation for password matching
                      if (confirmPasswordTouched || text) {
                        setConfirmPasswordTouched(true);
                        validateConfirmPassword(text);
                      }
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    mode="outlined"
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    left={<TextInput.Icon icon="lock-check" />}
                    error={confirmPasswordTouched && !!confirmPasswordError}
                  />
                  {confirmPasswordTouched && confirmPasswordError ? (
                    <HelperText type="error" visible={!!confirmPasswordError}>
                      {confirmPasswordError}
                    </HelperText>
                  ) : null}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSignup}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  loading={isButtonLoading}
                  disabled={isButtonLoading}>
                  Create Account
                </Button>

                <View style={styles.linkContainer}>
                  <Text variant="bodyMedium">Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#22C55E" />
              <Text style={styles.successTitle}>Registration Successful!</Text>
              <Text style={styles.successText}>
                Your account has been created successfully. You can now login with your credentials.
              </Text>
              <Button
                mode="contained"
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}>
                Proceed to Login
              </Button>
            </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: 4,
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
    marginTop: 12,
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
  successContainer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 20,
  },
  successTitle: {
    fontSize: 20,
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
  loginButton: {
    width: '100%',
    marginTop: 12,
  },
}); 