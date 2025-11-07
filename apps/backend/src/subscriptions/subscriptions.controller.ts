import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CancellationPayload,
  SubscriptionChangePayload,
  SubscriptionPlansResponse,
  SubscriptionStatus,
} from './subscriptions.types';
import { SubscriptionsService } from './subscriptions.service';

@Controller('api/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans(): SubscriptionPlansResponse {
    return this.subscriptionsService.listPlans();
  }

  @Get('status/:userId')
  getStatus(@Param('userId') userId: string): SubscriptionStatus {
    return this.subscriptionsService.getStatus(userId);
  }

  @Get('feature-gates/:userId')
  getFeatureGates(@Param('userId') userId: string) {
    return {
      featureAccess: this.subscriptionsService.featureGates(userId),
    };
  }

  @Post('subscribe')
  subscribe(@Body() payload: SubscriptionChangePayload): SubscriptionStatus {
    return this.subscriptionsService.subscribe(payload);
  }

  @Post('change')
  changePlan(@Body() payload: SubscriptionChangePayload): SubscriptionStatus {
    return this.subscriptionsService.changePlan(payload);
  }

  @Post('cancel')
  cancel(@Body() payload: CancellationPayload): SubscriptionStatus {
    return this.subscriptionsService.cancelSubscription(payload);
  }
}
