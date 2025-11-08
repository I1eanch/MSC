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
import { identityApi } from '../api/identity';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { validateEmail } from '../utils/validation';

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const analytics = useAnalytics();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    analytics.trackScreenView('ForgotPassword');
    analytics.trackForgotPasswordStarted();
  }, []);

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    setError(emailValidation.error || '');
    return emailValidation.isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await identityApi.forgotPassword({ email });
      analytics.trackForgotPasswordCompleted({ email });
      navigation.navigate('Success', {
        message: 'Password reset instructions have been sent to your email.',
        type: 'password-reset',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      analytics.trackForgotPasswordFailed(errorMessage);
      navigation.navigate('Failed', {
        message: errorMessage,
        type: 'password-reset',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    analytics.trackButtonClick('back_to_login', 'ForgotPassword');
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
              style={styles.emoji}
              accessibilityLabel="Lock icon"
            >
              🔐
            </Text>
            <Text
              style={styles.title}
              accessibilityRole="header"
            >
              Forgot Password?
            </Text>
            <Text
              style={styles.subtitle}
              accessibilityRole="text"
            >
              Don't worry! Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              error={error}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="email-input"
              accessibilityLabel="Email input field"
              accessibilityHint="Enter the email address associated with your account"
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.submitButton}
              testID="reset-button"
              accessibilityHint="Send password reset instructions to your email"
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleBackToLogin}
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              accessibilityHint="Navigate back to login screen"
            >
              <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  link: {
    ...theme.typography.bodyBold,
    color: theme.colors.primary,
  },
});

export default ForgotPasswordScreen;
