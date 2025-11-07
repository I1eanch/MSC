import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CancellationPayload,
  FeatureAccessItem,
  FeatureComparisonRow,
  SubscriptionChangePayload,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  SubscriptionPlansResponse,
  SubscriptionStatus,
} from './subscriptions.types';

type Lifecycle = SubscriptionStatus['status'];

@Injectable()
export class SubscriptionsService {
  private readonly featureCatalog: SubscriptionPlanFeature[] = [
    {
      key: 'basic_reporting',
      label: 'Basic reporting',
      description: 'Dashboards, CSV export and scheduled email summaries.',
    },
    {
      key: 'community_support',
      label: 'Community support',
      description: 'Access to the community forum with weekly office hours.',
    },
    {
      key: 'automation',
      label: 'Automation workflows',
      description: 'Trigger workflows from product events and webhooks.',
    },
    {
      key: 'priority_support',
      label: 'Priority support',
      description: 'Front-of-queue support with 1 hour SLA.',
    },
    {
      key: 'advanced_permissions',
      label: 'Advanced permissions',
      description: 'Granular workspace-level access controls and audit logs.',
    },
    {
      key: 'advanced_analytics',
      label: 'Advanced analytics',
      description: 'Forecasting, cohort analysis and custom metrics.',
    },
    {
      key: 'dedicated_success',
      label: 'Dedicated success manager',
      description: 'Strategic guidance from an assigned customer success partner.',
    },
  ];

  private readonly plans: SubscriptionPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'USD',
      billingInterval: 'monthly',
      description: 'Get started with collaboration basics and core analytics.',
      badge: 'Free',
      featureKeys: ['basic_reporting', 'community_support'],
      featureSummary: [
        'Unlimited viewers',
        'Core dashboards and CSV exports',
        'Community forum and templates',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 29,
      currency: 'USD',
      billingInterval: 'monthly',
      description: 'Automate workflows and accelerate team collaboration.',
      badge: 'Most popular',
      highlight: 'Unlock automation',
      savingsPercentage: 15,
      featureKeys: [
        'basic_reporting',
        'community_support',
        'automation',
        'priority_support',
        'advanced_permissions',
      ],
      featureSummary: [
        'Automation builder with 50 monthly runs',
        'Priority support with 1 hour SLA',
        'Role-based permissions and approvals',
      ],
    },
    {
      id: 'scale',
      name: 'Scale',
      price: 79,
      currency: 'USD',
      billingInterval: 'monthly',
      description: 'Enterprise-grade governance, analytics and service.',
      highlight: 'Enterprise readiness',
      savingsPercentage: 25,
      featureKeys: [
        'basic_reporting',
        'community_support',
        'automation',
        'priority_support',
        'advanced_permissions',
        'advanced_analytics',
        'dedicated_success',
      ],
      featureSummary: [
        'Unlimited automation runs and premium connectors',
        'Advanced analytics with predictive insights',
        'Dedicated customer success and quarterly reviews',
      ],
    },
  ];

  private readonly subscriptions = new Map<string, SubscriptionStatus>();
  private readonly cancellationLog: Array<{ userId: string; feedback?: string; cancelledAt: string }> = [];

  listPlans(): SubscriptionPlansResponse {
    return {
      plans: this.plans.map((plan) => ({
        ...plan,
        featureKeys: [...plan.featureKeys],
        featureSummary: [...plan.featureSummary],
      })),
      featureComparison: this.buildFeatureComparison(),
    };
  }

  getStatus(userId: string): SubscriptionStatus {
    const stored = this.subscriptions.get(userId);
    if (stored) {
      return stored;
    }

    const defaultPlan = this.findPlan('starter');

    const defaultStatus = this.buildStatus({
      userId,
      plan: defaultPlan,
      lifecycle: 'inactive',
    });

    this.subscriptions.set(userId, defaultStatus);
    return defaultStatus;
  }

  subscribe(payload: SubscriptionChangePayload): SubscriptionStatus {
    return this.saveSubscription({ ...payload, lifecycle: 'active' });
  }

  changePlan(payload: SubscriptionChangePayload): SubscriptionStatus {
    return this.saveSubscription({ ...payload, lifecycle: 'active' });
  }

  cancelSubscription(payload: CancellationPayload): SubscriptionStatus {
    const current = this.getStatus(payload.userId);

    const cancelled: SubscriptionStatus = {
      ...current,
      status: 'cancelled',
      renewsAt: null,
      endsAt: new Date().toISOString(),
      cancellationFeedback: payload.feedback,
    };

    this.subscriptions.set(payload.userId, cancelled);
    this.cancellationLog.push({
      userId: payload.userId,
      feedback: payload.feedback,
      cancelledAt: cancelled.endsAt!,
    });

    return cancelled;
  }

  featureGates(userId: string): FeatureAccessItem[] {
    return this.getStatus(userId).featureAccess;
  }

  private saveSubscription({ userId, planId, paymentIntentId, lifecycle }: SubscriptionChangePayload & { lifecycle: Lifecycle }): SubscriptionStatus {
    const plan = this.findPlan(planId);
    const status = this.buildStatus({
      userId,
      plan,
      lifecycle,
      paymentIntentId,
    });

    this.subscriptions.set(userId, status);
    return status;
  }

  private findPlan(planId: string): SubscriptionPlan {
    const plan = this.plans.find((candidate) => candidate.id === planId);

    if (!plan) {
      throw new NotFoundException(`Subscription plan ${planId} not found`);
    }

    return plan;
  }

  private buildFeatureComparison(): FeatureComparisonRow[] {
    return this.featureCatalog.map((feature) => ({
      key: feature.key,
      label: feature.label,
      description: feature.description,
      availability: this.plans.map((plan) => ({
        planId: plan.id,
        enabled: plan.featureKeys.includes(feature.key),
      })),
    }));
  }

  private buildStatus({
    userId,
    plan,
    lifecycle,
    paymentIntentId,
  }: {
    userId: string;
    plan: SubscriptionPlan;
    lifecycle: Lifecycle;
    paymentIntentId?: string;
  }): SubscriptionStatus {
    return {
      userId,
      planId: plan.id,
      planName: plan.name,
      status: lifecycle,
      renewsAt: this.resolveRenewalDate(plan, lifecycle),
      endsAt: null,
      billingInterval: plan.billingInterval,
      currency: plan.currency,
      price: plan.price,
      featureAccess: this.featureCatalog.map((feature) => ({
        key: feature.key,
        label: feature.label,
        description: feature.description,
        enabled: plan.featureKeys.includes(feature.key),
      })),
      lastTransactionId: paymentIntentId,
    };
  }

  private resolveRenewalDate(plan: SubscriptionPlan, lifecycle: Lifecycle): string | null {
    if (lifecycle !== 'active' || plan.price === 0) {
      return null;
    }

    const now = new Date();
    if (plan.billingInterval === 'monthly') {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.billingInterval === 'yearly') {
      now.setFullYear(now.getFullYear() + 1);
    }

    return now.toISOString();
  }
}
