import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { useAnalytics } from '../contexts/AnalyticsContext';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.trackScreenView('Welcome');
  }, []);

  const handleGetStarted = () => {
    analytics.trackButtonClick('get_started', 'Welcome');
    navigation.navigate('BenefitsCarousel');
  };

  const handleSignIn = () => {
    analytics.trackButtonClick('sign_in', 'Welcome');
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={styles.title}
            accessibilityRole="header"
            accessibilityLabel="Welcome to our app"
          >
            Welcome
          </Text>
          <Text
            style={styles.subtitle}
            accessibilityRole="text"
          >
            Start your journey with us today
          </Text>
        </View>

        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🚀</Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            testID="get-started-button"
            accessibilityHint="Navigates to benefits overview"
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            style={styles.signInButton}
            testID="sign-in-button"
            accessibilityHint="Navigates to login screen"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  illustration: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 120,
  },
  footer: {
    gap: theme.spacing.md,
  },
  signInButton: {
    marginTop: theme.spacing.sm,
  },
});

export default WelcomeScreen;
