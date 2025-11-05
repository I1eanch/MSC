import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createAnalytics } from '@packages/analytics-sdk';

const analytics = createAnalytics({
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  endpoint: 'http://localhost:3000/api/analytics',
});

export default function App() {
  useEffect(() => {
    analytics.track({ name: 'app_opened' });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile App</Text>
      <Text style={styles.subtitle}>React Native Application</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
