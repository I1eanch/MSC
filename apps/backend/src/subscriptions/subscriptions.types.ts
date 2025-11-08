export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionPlanFeature {
  key: string;
  label: string;
  description: string;
}

export interface SubscriptionFeatureAvailability {
  planId: string;
  enabled: boolean;
}

export interface FeatureComparisonRow {
  key: string;
  label: string;
  description: string;
  availability: SubscriptionFeatureAvailability[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  description: string;
  badge?: string;
  savingsPercentage?: number;
  highlight?: string;
  featureKeys: string[];
  featureSummary: string[];
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  featureComparison: FeatureComparisonRow[];
}

export interface FeatureAccessItem {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type SubscriptionLifecycleStatus = 'inactive' | 'trialing' | 'active' | 'cancelled';

export interface SubscriptionStatus {
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionLifecycleStatus;
  renewsAt: string | null;
  endsAt: string | null;
  billingInterval: BillingInterval;
  currency: string;
  price: number;
  featureAccess: FeatureAccessItem[];
  lastTransactionId?: string;
  cancellationFeedback?: string;
}

export interface SubscriptionChangePayload {
  userId: string;
  planId: string;
  paymentIntentId?: string;
}

export interface CancellationPayload {
  userId: string;
  feedback?: string;
}
