import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Button } from '../components/Button';
import { theme } from '../constants/theme';
import { useAnalytics } from '../contexts/AnalyticsContext';

type BenefitsCarouselScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BenefitsCarousel'>;
};

const { width } = Dimensions.get('window');

interface Benefit {
  title: string;
  description: string;
  emoji: string;
}

const benefits: Benefit[] = [
  {
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely with industry-standard protection.',
    emoji: '🔒',
  },
  {
    title: 'Easy to Use',
    description: 'Simple and intuitive interface designed for everyone.',
    emoji: '✨',
  },
  {
    title: 'Always Available',
    description: 'Access your account anytime, anywhere, on any device.',
    emoji: '🌍',
  },
];

const BenefitsCarouselScreen: React.FC<BenefitsCarouselScreenProps> = ({ navigation }) => {
  const analytics = useAnalytics();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    analytics.trackScreenView('BenefitsCarousel');
  }, []);

  useEffect(() => {
    analytics.trackBenefitsCarouselViewed(currentIndex);
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleNext = () => {
    if (currentIndex < benefits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      analytics.trackBenefitsCarouselCompleted();
      navigation.navigate('SignUp');
    }
  };

  const handleSkip = () => {
    analytics.trackButtonClick('skip_benefits', 'BenefitsCarousel');
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.skipContainer}>
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="outline"
            style={styles.skipButton}
            testID="skip-button"
            accessibilityHint="Skip benefits overview and go to sign up"
          />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          accessibilityRole="adjustable"
          accessibilityLabel="Benefits carousel"
          accessibilityHint="Swipe left or right to view different benefits"
        >
          {benefits.map((benefit, index) => (
            <View key={index} style={[styles.slide, { width }]}>
              <Text style={styles.emoji}>{benefit.emoji}</Text>
              <Text
                style={styles.title}
                accessibilityRole="header"
              >
                {benefit.title}
              </Text>
              <Text
                style={styles.description}
                accessibilityRole="text"
              >
                {benefit.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.pagination}>
          {benefits.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
              accessible={false}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title={currentIndex === benefits.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            testID="next-button"
            accessibilityHint={
              currentIndex === benefits.length - 1
                ? 'Proceed to sign up'
                : 'View next benefit'
            }
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
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  skipButton: {
    width: 100,
    height: 40,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emoji: {
    fontSize: 100,
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
});

export default BenefitsCarouselScreen;
