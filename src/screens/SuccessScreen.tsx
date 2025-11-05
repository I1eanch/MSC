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

type SuccessScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Success'>;
  route: RouteProp<RootStackParamList, 'Success'>;
};

const SuccessScreen: React.FC<SuccessScreenProps> = ({ navigation, route }) => {
  const analytics = useAnalytics();
  const { message, type } = route.params;

  useEffect(() => {
    analytics.trackScreenView('Success', { type });
  }, [type]);

  const handleContinue = () => {
    analytics.trackButtonClick('continue', 'Success', { type });
    navigation.navigate('Welcome');
  };

  const getTitle = () => {
    switch (type) {
      case 'signup':
        return 'Account Created!';
      case 'login':
        return 'Welcome Back!';
      case 'password-reset':
        return 'Email Sent!';
      default:
        return 'Success!';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text
            style={styles.icon}
            accessibilityLabel="Success checkmark"
          >
            ✅
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
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            {message}
          </Text>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            testID="continue-button"
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
    color: theme.colors.text,
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
  },
});

export default SuccessScreen;
