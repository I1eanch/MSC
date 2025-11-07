import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { createAnalytics } from '@packages/analytics-sdk';

const analytics = createAnalytics({
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  endpoint: '/api/analytics',
});

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    analytics.track({ name: 'page_view' });
  }, []);

  return <Component {...pageProps} />;
}
