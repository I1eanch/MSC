export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export function createApiClient(baseURL: string = API_BASE_URL) {
  return {
    baseURL,
    getUrl: (path: string) => `${baseURL}${path}`,
  };
}

export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionPlanFeature {
  key: string;
  label: string;
  description: string;
}

export interface FeatureComparisonAvailability {
  planId: string;
  enabled: boolean;
}

export interface FeatureComparisonRow {
  key: string;
  label: string;
  description: string;
  availability: FeatureComparisonAvailability[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingInterval: BillingInterval;
  description: string;
  badge?: string;
  highlight?: string;
  savingsPercentage?: number;
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

export interface SubscriptionChangeInput {
  userId: string;
  planId: string;
  paymentIntentId?: string;
}

export interface CancelSubscriptionInput {
  userId: string;
  feedback?: string;
}

export interface SubscriptionApi {
  listPlans: () => Promise<SubscriptionPlansResponse>;
  getStatus: (userId: string) => Promise<SubscriptionStatus>;
  getFeatureGates: (userId: string) => Promise<FeatureAccessItem[]>;
  subscribe: (input: SubscriptionChangeInput) => Promise<SubscriptionStatus>;
  changePlan: (input: SubscriptionChangeInput) => Promise<SubscriptionStatus>;
  cancel: (input: CancelSubscriptionInput) => Promise<SubscriptionStatus>;
}

function unwrapResponse<T>(payload: ApiResponse<T> | T): T {
  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

export function createSubscriptionApi(baseURL: string = API_BASE_URL): SubscriptionApi {
  const client = createApiClient(baseURL);

  const request = async <T>(
    path: string,
    init?: { method?: string; headers?: Record<string, string>; body?: string },
  ): Promise<T> => {
    const response = await fetch(client.getUrl(path), {
      method: init?.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: init?.body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Request failed (${response.status}): ${errorBody}`);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    const parsed = JSON.parse(text) as ApiResponse<T> | T;
    return unwrapResponse<T>(parsed);
  };

  return {
    listPlans: async () => request<SubscriptionPlansResponse>('/subscriptions/plans'),
    getStatus: async (userId: string) =>
      request<SubscriptionStatus>(`/subscriptions/status/${encodeURIComponent(userId)}`),
    getFeatureGates: async (userId: string) => {
      const result = await request<{ featureAccess: FeatureAccessItem[] }>(
        `/subscriptions/feature-gates/${encodeURIComponent(userId)}`,
      );

      return result.featureAccess;
    },
    subscribe: async (input: SubscriptionChangeInput) =>
      request<SubscriptionStatus>('/subscriptions/subscribe', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    changePlan: async (input: SubscriptionChangeInput) =>
      request<SubscriptionStatus>('/subscriptions/change', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    cancel: async (input: CancelSubscriptionInput) =>
      request<SubscriptionStatus>('/subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  };
}
