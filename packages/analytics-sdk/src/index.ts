export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

export interface AnalyticsConfig {
  enabled: boolean;
  trackingId?: string;
  endpoint?: string;
}

export class Analytics {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  track(event: AnalyticsEvent): void {
    if (!this.config.enabled) {
      return;
    }

    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.eventQueue.push(enrichedEvent);
    this.flushIfNeeded();
  }

  private flushIfNeeded(): void {
    if (this.eventQueue.length >= 10) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.config.endpoint) {
      return;
    }

    const events = this.eventQueue.splice(0);
    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
    }
  }

  getEventCount(): number {
    return this.eventQueue.length;
  }
}

export function createAnalytics(config: AnalyticsConfig): Analytics {
  return new Analytics(config);
}
