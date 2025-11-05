import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { useAnalytics } from '../contexts/AnalyticsContext';

type FailedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Failed'>;
  route: RouteProp<RootStackParamList, 'Failed'>;
};

const FailedScreen: React.FC<FailedScreenProps> = ({ navigation, route }) => {
  const analytics = useAnalytics();
  const { message, type } = route.params;

  useEffect(() => {
    analytics.trackScreenView('Failed', { type });
  }, [type]);

  const handleTryAgain = () => {
    analytics.trackButtonClick('try_again', 'Failed', { type });
    
    switch (type) {
      case 'signup':
        navigation.navigate('SignUp');
        break;
      case 'login':
        navigation.navigate('Login');
        break;
      case 'password-reset':
        navigation.navigate('ForgotPassword');
        break;
      default:
        navigation.navigate('Welcome');
    }
  };

  const handleBackHome = () => {
    analytics.trackButtonClick('back_home', 'Failed', { type });
    navigation.navigate('Welcome');
  };

  const getTitle = () => {
    switch (type) {
      case 'signup':
        return 'Sign Up Failed';
      case 'login':
        return 'Login Failed';
      case 'password-reset':
        return 'Reset Failed';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text
            style={styles.icon}
            accessibilityLabel="Error icon"
          >
            ❌
          </Text>
        </View>

        <View style={styles.textContainer}>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {getTitle()}
          </Text>
          <Text
            style={styles.message}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            {message}
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Try Again"
            onPress={handleTryAgain}
            testID="try-again-button"
            accessibilityHint={`Return to ${type} screen`}
          />
          <Button
            title="Back to Home"
            onPress={handleBackHome}
            variant="outline"
            style={styles.secondaryButton}
            testID="back-home-button"
            accessibilityHint="Return to welcome screen"
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
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  icon: {
    fontSize: 100,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
  },
});

export default FailedScreen;
