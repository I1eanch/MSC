import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { analytics } from '../utils/analytics';

interface AnalyticsContextType {
  analytics: typeof analytics;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context.analytics;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useEffect(() => {
    analytics.setEnabled(true);
  }, []);

  const value: AnalyticsContextType = {
    analytics,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};
