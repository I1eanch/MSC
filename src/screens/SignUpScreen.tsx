import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { theme } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateName,
} from '../utils/validation';

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SignUp'>;
};

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();
  const analytics = useAnalytics();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    analytics.trackScreenView('SignUp');
    analytics.trackSignupStarted();
  }, []);

  const validateForm = () => {
    const firstNameValidation = validateName(firstName, 'First name');
    const lastNameValidation = validateName(lastName, 'Last name');
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);

    setErrors({
      firstName: firstNameValidation.error || '',
      lastName: lastNameValidation.error || '',
      email: emailValidation.error || '',
      password: passwordValidation.error || '',
      confirmPassword: confirmPasswordValidation.error || '',
    });

    return (
      firstNameValidation.isValid &&
      lastNameValidation.isValid &&
      emailValidation.isValid &&
      passwordValidation.isValid &&
      confirmPasswordValidation.isValid
    );
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, firstName, lastName);
      analytics.trackSignupCompleted({ email });
      navigation.navigate('Success', {
        message: 'Your account has been created successfully!',
        type: 'signup',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      analytics.trackSignupFailed(errorMessage);
      navigation.navigate('Failed', {
        message: errorMessage,
        type: 'signup',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    analytics.trackButtonClick('sign_in_link', 'SignUp');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text
              style={styles.title}
              accessibilityRole="header"
            >
              Create Account
            </Text>
            <Text
              style={styles.subtitle}
              accessibilityRole="text"
            >
              Sign up to get started
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.firstName}
              placeholder="Enter your first name"
              autoCapitalize="words"
              autoCorrect={false}
              testID="first-name-input"
              accessibilityLabel="First name input field"
              accessibilityHint="Enter your first name"
            />

            <Input
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              error={errors.lastName}
              placeholder="Enter your last name"
              autoCapitalize="words"
              autoCorrect={false}
              testID="last-name-input"
              accessibilityLabel="Last name input field"
              accessibilityHint="Enter your last name"
            />

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
              accessibilityLabel="Email input field"
              accessibilityHint="Enter your email address"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              testID="password-input"
              accessibilityLabel="Password input field"
              accessibilityHint="Enter your password, must be at least 8 characters with uppercase, lowercase, and number"
            />

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              testID="confirm-password-input"
              accessibilityLabel="Confirm password input field"
              accessibilityHint="Re-enter your password to confirm"
            />

            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              style={styles.submitButton}
              testID="sign-up-button"
              accessibilityHint="Create your account with the provided information"
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <TouchableOpacity
                onPress={handleSignIn}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityHint="Navigate to login screen"
              >
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  link: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
});

export default SignUpScreen;
