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
import { validateEmail } from '../utils/validation';
import { OAuthProvider } from '../utils/oauth';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login, loginWithOAuth } = useAuth();
  const analytics = useAnalytics();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    analytics.trackScreenView('Login');
    analytics.trackLoginStarted();
  }, []);

  const validateForm = () => {
    const emailValidation = validateEmail(email);
    const passwordError = password ? '' : 'Password is required';

    setErrors({
      email: emailValidation.error || '',
      password: passwordError,
    });

    return emailValidation.isValid && !passwordError;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      analytics.trackLoginCompleted({ email });
      navigation.navigate('Success', {
        message: 'You have successfully logged in!',
        type: 'login',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to login';
      analytics.trackLoginFailed(errorMessage);
      navigation.navigate('Failed', {
        message: errorMessage,
        type: 'login',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    analytics.trackButtonClick('forgot_password', 'Login');
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    analytics.trackButtonClick('sign_up_link', 'Login');
    navigation.navigate('SignUp');
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    setLoading(true);
    try {
      analytics.trackButtonClick(`oauth_${provider}`, 'Login');
      await loginWithOAuth(provider);
      analytics.trackLoginCompleted({ method: provider });
      navigation.navigate('Success', {
        message: 'You have successfully logged in!',
        type: 'login',
      });
    } catch (error: any) {
      const errorMessage = error.message || `Failed to login with ${provider}`;
      analytics.trackLoginFailed(errorMessage);
      navigation.navigate('Failed', {
        message: errorMessage,
        type: 'login',
      });
    } finally {
      setLoading(false);
    }
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
              Welcome Back
            </Text>
            <Text
              style={styles.subtitle}
              accessibilityRole="text"
            >
              Sign in to continue
            </Text>
          </View>

          <View style={styles.form}>
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
              accessibilityHint="Enter your password"
            />

            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
              accessibilityHint="Navigate to password recovery screen"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.submitButton}
              testID="sign-in-button"
              accessibilityHint="Sign in with your email and password"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <Button
                title="Google"
                onPress={() => handleOAuthLogin(OAuthProvider.GOOGLE)}
                loading={loading}
                style={styles.socialButton}
                testID="google-login-button"
              />
              <Button
                title="Apple"
                onPress={() => handleOAuthLogin(OAuthProvider.APPLE)}
                loading={loading}
                style={styles.socialButton}
                testID="apple-login-button"
              />
            </View>

            <View style={styles.socialButtons}>
              <Button
                title="VK"
                onPress={() => handleOAuthLogin(OAuthProvider.VK)}
                loading={loading}
                style={styles.socialButton}
                testID="vk-login-button"
              />
              <Button
                title="Yandex"
                onPress={() => handleOAuthLogin(OAuthProvider.YANDEX)}
                loading={loading}
                style={styles.socialButton}
                testID="yandex-login-button"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <TouchableOpacity
                onPress={handleSignUp}
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                accessibilityHint="Navigate to sign up screen"
              >
                <Text style={styles.link}>Sign Up</Text>
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
    justifyContent: 'center',
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    ...theme.typography.body,
    color: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border || '#E5E5E5',
  },
  dividerText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
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

export default LoginScreen;
