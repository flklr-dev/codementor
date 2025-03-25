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
import { registerUser, clearError } from '../store/slices/authSlice';
import { isValidEmail, getPasswordStrength, getPasswordStrengthColor } from '../utils/validation';

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
  
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  
  const dispatch = useAppDispatch();
  const { error, isLoading, token } = useAppSelector(state => state.auth);

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

  // Show success dialog and navigate to login
  const showSuccessAndNavigate = () => {
    setSuccessDialogVisible(true);
    // Clear form
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    // Reset touched states
    setNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
  };

  // Effect to show success dialog on successful registration
  useEffect(() => {
    if (token) {
      showSuccessAndNavigate();
    }
  }, [token]);

  // Effect to show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
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
      dispatch(registerUser({ name, email, password }));
    }
  };

  const handleGoogleSignup = async () => {
    Alert.alert('Coming Soon', 'Google signup will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="titleLarge" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Join CodeMentor and start learning
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
                onChangeText={setPassword}
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
                onChangeText={setConfirmPassword}
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
              loading={isLoading}
              disabled={isLoading || 
                (confirmPasswordTouched && !!confirmPasswordError) ||
                (passwordTouched && !!passwordError) ||
                (emailTouched && !!emailError) ||
                (nameTouched && !!nameError)}>
              Create Account
            </Button>

            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
              <Divider style={styles.divider} />
            </View>

            <Button
              mode="outlined"
              icon="google"
              onPress={handleGoogleSignup}
              style={styles.googleButton}>
              Google
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Dialog */}
      <Portal>
        <Dialog
          visible={successDialogVisible}
          onDismiss={() => {
            setSuccessDialogVisible(false);
            navigation.navigate('Login');
          }}>
          <Dialog.Icon icon="check-circle" size={40} color={theme.colors.primary} />
          <Dialog.Title style={styles.dialogTitle}>Registration Successful!</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              Your account has been created successfully. Please login to continue your coding journey.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setSuccessDialogVisible(false);
                navigation.navigate('Login');
              }}>
              Go to Login
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingVertical: 10,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginBottom: 16,
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
  dialogTitle: {
    textAlign: 'center',
  },
  dialogContent: {
    textAlign: 'center',
  },
}); 