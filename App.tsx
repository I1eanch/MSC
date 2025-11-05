import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/contexts/AuthContext';
import { AnalyticsProvider } from './src/contexts/AnalyticsContext';
import WelcomeScreen from './src/screens/WelcomeScreen';
import BenefitsCarouselScreen from './src/screens/BenefitsCarouselScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import FailedScreen from './src/screens/FailedScreen';

export type RootStackParamList = {
  Welcome: undefined;
  BenefitsCarousel: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  Success: { message: string; type: 'signup' | 'login' | 'password-reset' };
  Failed: { message: string; type: 'signup' | 'login' | 'password-reset' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="BenefitsCarousel" component={BenefitsCarouselScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="Failed" component={FailedScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </AnalyticsProvider>
  );
}
