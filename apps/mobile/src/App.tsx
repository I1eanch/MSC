import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createAnalytics } from '@packages/analytics-sdk';
import {
  BillingInterval,
  FeatureComparisonRow,
  FeatureAccessItem,
  SubscriptionPlan,
  SubscriptionStatus,
  createSubscriptionApi,
} from '@packages/api-client';
import { createPaymentClient } from '@packages/payment-sdk';

const analytics = createAnalytics({
  enabled: process.env.REACT_APP_ANALYTICS_ENABLED === 'true',
  endpoint: 'http://localhost:3000/api/analytics',
});

const subscriptionApi = createSubscriptionApi();
const paymentClient = createPaymentClient({
  environment:
    process.env.REACT_APP_PAYMENT_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  publishableKey: process.env.REACT_APP_PAYMENT_PUBLIC_KEY || 'demo_public_key',
});

const USER_ID = 'demo-mobile-user';

const trackEvent = (name: string, properties?: Record<string, unknown>) => {
  analytics.track({ name, properties });
  analytics.flush().catch(() => undefined);
};

const formatCurrency = (amount: number, currency: string): string => {
  if (amount === 0) {
    return 'Free';
  }

  const symbol = currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${amount.toFixed(2)}`;
};

const formatInterval = (interval: BillingInterval): string =>
  interval === 'monthly' ? 'month' : 'year';

const formatDate = (iso: string | null): string => {
  if (!iso) {
    return 'No upcoming renewal';
  }

  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return iso;
  }
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [featureComparison, setFeatureComparison] = useState<FeatureComparisonRow[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showCancellationInput, setShowCancellationInput] = useState(false);

  useEffect(() => {
    trackEvent('app_opened', { surface: 'mobile' });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const [plansResponse, subscriptionStatus] = await Promise.all([
          subscriptionApi.listPlans(),
          subscriptionApi.getStatus(USER_ID),
        ]);

        if (!isMounted) {
          return;
        }

        setPlans(plansResponse.plans);
        setFeatureComparison(plansResponse.featureComparison);
        setStatus(subscriptionStatus);
        setSelectedPlanId(subscriptionStatus.planId);
        setErrorMessage(null);
        trackEvent('subscription_paywall_viewed', {
          userId: USER_ID,
          currentPlan: subscriptionStatus.planId,
          status: subscriptionStatus.status,
        });
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage('Unable to load subscription options. Please try again later.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlanSelection = (planId: string) => {
    setSelectedPlanId(planId);
    setShowCancellationInput(false);
    setFeedback('');
    setSuccessMessage(null);
    setErrorMessage(null);

    trackEvent('subscription_plan_selected', {
      userId: USER_ID,
      planId,
    });
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlanId) {
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
    if (!selectedPlan) {
      return;
    }

    const alreadyOnSelectedPlan =
      status?.status === 'active' && status.planId === selectedPlanId;

    if (alreadyOnSelectedPlan) {
      setSuccessMessage('You are already enjoying this plan.');
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      trackEvent('subscription_checkout_started', {
        userId: USER_ID,
        planId: selectedPlan.id,
        previousPlanId: status?.planId,
      });

      const paymentResult = await paymentClient.startCheckout({
        userId: USER_ID,
        planId: selectedPlan.id,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        metadata: {
          previousPlanId: status?.planId ?? null,
        },
      });

      if (!paymentResult.success) {
        setErrorMessage('Payment failed. Please try again or contact support.');
        trackEvent('subscription_checkout_failed', {
          userId: USER_ID,
          planId: selectedPlan.id,
          errorCode: paymentResult.errorCode,
        });
        return;
      }

      const updatedStatus =
        status && status.status === 'active'
          ? await subscriptionApi.changePlan({
              userId: USER_ID,
              planId: selectedPlan.id,
              paymentIntentId: paymentResult.transactionId,
            })
          : await subscriptionApi.subscribe({
              userId: USER_ID,
              planId: selectedPlan.id,
              paymentIntentId: paymentResult.transactionId,
            });

      setStatus(updatedStatus);
      setSelectedPlanId(updatedStatus.planId);
      setShowCancellationInput(false);
      setFeedback('');
      setSuccessMessage(`You are now on the ${updatedStatus.planName} plan.`);

      trackEvent('subscription_update_success', {
        userId: USER_ID,
        planId: updatedStatus.planId,
        previousPlanId: status?.planId,
      });
    } catch (error) {
      setErrorMessage('Unable to update subscription. Please try again later.');
      trackEvent('subscription_update_failed', {
        userId: USER_ID,
        planId: selectedPlan.id,
        message: (error as Error).message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!status || status.status !== 'active') {
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      trackEvent('subscription_cancellation_started', {
        userId: USER_ID,
        planId: status.planId,
      });

      const cancellation = await subscriptionApi.cancel({
        userId: USER_ID,
        feedback: feedback.trim() ? feedback.trim() : undefined,
      });

      setStatus(cancellation);
      setSelectedPlanId(cancellation.planId);
      setFeedback('');
      setShowCancellationInput(false);
      setSuccessMessage('Your subscription has been cancelled.');

      trackEvent('subscription_cancelled', {
        userId: USER_ID,
        planId: status.planId,
        feedbackProvided: Boolean(cancellation.cancellationFeedback),
      });
    } catch (error) {
      setErrorMessage('Unable to cancel subscription. Please try again later.');
      trackEvent('subscription_cancellation_failed', {
        userId: USER_ID,
        planId: status?.planId,
        message: (error as Error).message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1f2937" />
          <Text style={styles.loadingText}>Loading subscription details…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isSelectionCurrent =
    status?.status === 'active' && selectedPlanId === status.planId;

  const confirmCtaLabel = !selectedPlanId
    ? 'Select a plan'
    : isSelectionCurrent
    ? 'Already on this plan'
    : status?.status === 'active'
    ? 'Confirm plan change'
    : 'Upgrade now';

  const featureAccess: FeatureAccessItem[] = status?.featureAccess ?? [];

  const badgeStyleMap = {
    active: styles.statusBadge_active,
    cancelled: styles.statusBadge_cancelled,
    inactive: styles.statusBadge_inactive,
    trialing: styles.statusBadge_trialing,
  } as const;

  const badgeStyle =
    status?.status
      ? badgeStyleMap[status.status] ?? styles.statusBadge_inactive
      : styles.statusBadge_inactive;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Unlock the full experience</Text>
        <Text style={styles.subtitle}>
          Compare plans, review features and manage your subscription in one place.
        </Text>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

        {status ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current subscription</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Text style={styles.statusPlan}>{status.planName}</Text>
                <Text style={[styles.statusBadge, badgeStyle]}>
                  {status.status === 'active'
                    ? 'Active'
                    : status.status === 'cancelled'
                    ? 'Cancelled'
                    : 'Not activated'}
                </Text>
              </View>
              <Text style={styles.statusMeta}>Renews: {formatDate(status.renewsAt)}</Text>
              {status.status === 'cancelled' && status.endsAt ? (
                <Text style={styles.statusMeta}>Access ends: {formatDate(status.endsAt)}</Text>
              ) : null}
              {status.cancellationFeedback ? (
                <Text style={styles.statusFeedback}>
                  Cancellation feedback: {status.cancellationFeedback}
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing plans</Text>
          <View style={styles.planGrid}>
            {plans.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const isCurrentPlan = status?.planId === plan.id && status.status === 'active';
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    isCurrentPlan && styles.planCardCurrent,
                  ]}
                  onPress={() => handlePlanSelection(plan.id)}
                  disabled={isUpdating}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {plan.badge ? <Text style={styles.planBadge}>{plan.badge}</Text> : null}
                  </View>
                  {plan.highlight ? (
                    <Text style={styles.planHighlight}>{plan.highlight}</Text>
                  ) : null}
                  <Text style={styles.planPrice}>{formatCurrency(plan.price, plan.currency)}</Text>
                  <Text style={styles.planInterval}>per {formatInterval(plan.billingInterval)}</Text>
                  <View style={styles.planSummary}>
                    {plan.featureSummary.map((summary) => (
                      <Text key={summary} style={styles.planSummaryItem}>
                        • {summary}
                      </Text>
                    ))}
                  </View>
                  {isCurrentPlan ? <Text style={styles.planCurrent}>Current plan</Text> : null}
                  {!isCurrentPlan && isSelected ? (
                    <Text style={styles.planSelectedLabel}>Selected</Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, (isSelectionCurrent || !selectedPlanId || isUpdating) && styles.primaryButtonDisabled]}
            onPress={handleConfirmPlan}
            disabled={!selectedPlanId || isSelectionCurrent || isUpdating}
          >
            <Text style={styles.primaryButtonText}>{confirmCtaLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature comparison</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableFeatureCell, styles.tableHeaderText]}>Feature</Text>
            {plans.map((plan) => (
              <Text key={plan.id} style={[styles.tablePlanCell, styles.tableHeaderText]}>
                {plan.name}
              </Text>
            ))}
          </View>
          {featureComparison.map((row) => (
            <View key={row.key} style={styles.tableRow}>
              <View style={styles.tableFeatureCell}>
                <Text style={styles.tableFeatureName}>{row.label}</Text>
                <Text style={styles.tableFeatureDescription}>{row.description}</Text>
              </View>
              {plans.map((plan) => {
                const availability = row.availability.find(
                  (item) => item.planId === plan.id,
                );
                const enabled = availability ? availability.enabled : false;
                return (
                  <View key={`${row.key}-${plan.id}`} style={styles.tablePlanCell}>
                    <Text style={enabled ? styles.tableCheck : styles.tableDash}>
                      {enabled ? '✓' : '—'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your feature access</Text>
          {featureAccess.map((feature) => (
            <View key={feature.key} style={styles.featureRow}>
              <View
                style={[
                  styles.featureIcon,
                  feature.enabled ? styles.featureIconEnabled : styles.featureIconDisabled,
                ]}
              >
                {feature.enabled ? <Text style={styles.featureIconText}>✓</Text> : null}
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.label}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <Text
                style={[
                  styles.featureStatus,
                  feature.enabled ? styles.featureStatusEnabled : styles.featureStatusDisabled,
                ]}
              >
                {feature.enabled ? 'Included' : 'Upgrade'}
              </Text>
            </View>
          ))}
          {featureAccess.length === 0 ? (
            <Text style={styles.featureEmptyState}>
              Select a plan to instantly unlock new features.
            </Text>
          ) : null}
        </View>

        {status && status.status === 'active' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage subscription</Text>
            {showCancellationInput ? (
              <View style={styles.cancellationContainer}>
                <Text style={styles.cancellationPrompt}>
                  We are sorry to see you leave. Do you mind sharing feedback?
                </Text>
                <TextInput
                  style={styles.feedbackInput}
                  multiline
                  value={feedback}
                  onChangeText={setFeedback}
                  placeholder="I am cancelling because…"
                  placeholderTextColor="#9ca3af"
                  editable={!isUpdating}
                />
                <TouchableOpacity
                  style={[styles.secondaryButton, isUpdating && styles.secondaryButtonDisabled]}
                  onPress={handleCancelSubscription}
                  disabled={isUpdating}
                >
                  <Text style={styles.secondaryButtonText}>Submit cancellation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ghostButton}
                  onPress={() => {
                    setShowCancellationInput(false);
                    setFeedback('');
                  }}
                  disabled={isUpdating}
                >
                  <Text style={styles.ghostButtonText}>Keep subscription</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.secondaryButton, isUpdating && styles.secondaryButtonDisabled]}
                onPress={() => {
                  setShowCancellationInput(true);
                  trackEvent('subscription_cancellation_intent', {
                    userId: USER_ID,
                    planId: status.planId,
                  });
                }}
                disabled={isUpdating}
              >
                <Text style={styles.secondaryButtonText}>Cancel subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 24,
    backgroundColor: '#0f172a',
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#e2e8f0',
    marginTop: 12,
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5f5',
    lineHeight: 22,
  },
  error: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    color: '#fca5a5',
    padding: 12,
    borderRadius: 12,
  },
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#bbf7d0',
    padding: 12,
    borderRadius: 12,
  },
  section: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  statusCard: {
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPlan: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusBadge_active: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#4ade80',
  },
  statusBadge_cancelled: {
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    color: '#fca5a5',
  },
  statusBadge_inactive: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    color: '#cbd5f5',
  },
  statusBadge_trialing: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#93c5fd',
  },
  statusMeta: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  statusFeedback: {
    color: '#fbbf24',
    fontSize: 14,
  },
  planGrid: {
    gap: 16,
  },
  planCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    gap: 12,
  },
  planCardSelected: {
    borderColor: '#6366f1',
  },
  planCardCurrent: {
    borderColor: '#22c55e',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc',
  },
  planBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: 'uppercase',
  },
  planHighlight: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
  },
  planInterval: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  planSummary: {
    gap: 6,
  },
  planSummaryItem: {
    color: '#cbd5f5',
    fontSize: 14,
  },
  planCurrent: {
    color: '#4ade80',
    fontWeight: '600',
  },
  planSelectedLabel: {
    color: '#a855f7',
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)',
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  tableHeaderText: {
    color: '#cbd5f5',
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  tableFeatureCell: {
    flex: 2,
    paddingRight: 12,
    gap: 4,
  },
  tablePlanCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableFeatureName: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  tableFeatureDescription: {
    color: '#94a3b8',
    fontSize: 12,
  },
  tableCheck: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: '700',
  },
  tableDash: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconEnabled: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  featureIconDisabled: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
  },
  featureIconText: {
    color: '#4ade80',
    fontWeight: '700',
  },
  featureContent: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  featureDescription: {
    color: '#94a3b8',
    fontSize: 13,
  },
  featureStatus: {
    fontWeight: '600',
  },
  featureStatusEnabled: {
    color: '#4ade80',
  },
  featureStatusDisabled: {
    color: '#c4b5fd',
  },
  featureEmptyState: {
    color: '#94a3b8',
  },
  cancellationContainer: {
    gap: 16,
  },
  cancellationPrompt: {
    color: '#f8fafc',
    fontSize: 14,
  },
  feedbackInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    minHeight: 96,
    padding: 12,
    color: '#f8fafc',
  },
  secondaryButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonDisabled: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  secondaryButtonText: {
    color: '#fca5a5',
    fontWeight: '600',
    fontSize: 16,
  },
  ghostButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
