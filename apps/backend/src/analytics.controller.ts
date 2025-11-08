import { Body, Controller, Post } from '@nestjs/common';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

@Controller('api/analytics')
export class AnalyticsController {
  private readonly events: AnalyticsEvent[] = [];

  @Post()
  record(@Body() payload: { events?: AnalyticsEvent[] }) {
    const incoming = payload?.events ?? [];

    incoming.forEach((event) => {
      this.events.push({
        ...event,
        timestamp: event.timestamp ?? new Date().toISOString(),
      });
    });

    return {
      received: incoming.length,
      storedEvents: this.events.length,
    };
  }
}
