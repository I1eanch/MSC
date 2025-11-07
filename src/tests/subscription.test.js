const SubscriptionService = require('../../src/services/SubscriptionService');
const Subscription = require('../../src/models/Subscription');
const SubscriptionPlan = require('../../src/models/SubscriptionPlan');
const Entitlement = require('../../src/models/Entitlement');

// Mock payment provider
class MockPaymentProvider {
  async createSubscription(customerId, planId, paymentMethodId) {
    return {
      id: 'sub_test123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
      trial_end: null
    };
  }

  async cancelSubscription(subscriptionId) {
    return {
      id: subscriptionId,
      cancel_at_period_end: true
    };
  }
}

describe('Subscription Service', () => {
  let subscriptionService;
  let mockProvider;

  beforeEach(() => {
    mockProvider = new MockPaymentProvider();
    subscriptionService = new SubscriptionService(mockProvider);
  });

  describe('Subscription Creation', () => {
    it('should create a free subscription', async () => {
      const userId = 'user_123';
      const planId = 'free';

      const subscription = await subscriptionService.createSubscription(userId, planId);

      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(planId);
      expect(subscription.status).toBe('active');
      expect(subscription.entitlements).toContain('basic_content');
    });

    it('should create a premium subscription', async () => {
      const userId = 'user_123';
      const planId = 'premium';
      const paymentMethodId = 'pm_test123';

      // Create user with payment customer ID
      subscriptionService.createUser({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        paymentCustomerId: 'cus_test123'
      });

      const subscription = await subscriptionService.createSubscription(userId, planId, paymentMethodId);

      expect(subscription).toBeDefined();
      expect(subscription.userId).toBe(userId);
      expect(subscription.planId).toBe(planId);
      expect(subscription.status).toBe('active');
      expect(subscription.entitlements).toContain('exclusive_content');
      expect(subscription.entitlements).toContain('hd_streaming');
    });

    it('should throw error for paid plan without payment method', async () => {
      const userId = 'user_123';
      const planId = 'premium';

      await expect(
        subscriptionService.createSubscription(userId, planId)
      ).rejects.toThrow('Payment method required for paid subscription');
    });

    it('should throw error for non-existent plan', async () => {
      const userId = 'user_123';
      const planId = 'nonexistent';

      await expect(
        subscriptionService.createSubscription(userId, planId)
      ).rejects.toThrow('Plan nonexistent not found');
    });
  });

  describe('Subscription Management', () => {
    let testSubscription;

    beforeEach(async () => {
      const userId = 'user_123';
      subscriptionService.createUser({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        paymentCustomerId: 'cus_test123'
      });

      testSubscription = await subscriptionService.createSubscription(userId, 'free');
    });

    it('should cancel subscription', async () => {
      const updatedSubscription = await subscriptionService.cancelSubscription(
        testSubscription.userId,
        testSubscription.id
      );

      expect(updatedSubscription.cancelAtPeriodEnd).toBe(true);
    });

    it('should update subscription status', async () => {
      const updatedSubscription = await subscriptionService.updateSubscription(
        testSubscription.userId,
        testSubscription.id,
        { status: 'past_due' }
      );

      expect(updatedSubscription.status).toBe('past_due');
    });

    it('should update subscription plan', async () => {
      const updatedSubscription = await subscriptionService.updateSubscription(
        testSubscription.userId,
        testSubscription.id,
        { planId: 'premium' }
      );

      expect(updatedSubscription.planId).toBe('premium');
      expect(updatedSubscription.entitlements).toContain('exclusive_content');
    });
  });

  describe('Entitlement Checks', () => {
    let userId;

    beforeEach(async () => {
      userId = 'user_entitlement_' + Math.random().toString(36).substr(2, 9);
      subscriptionService.createUser({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        paymentCustomerId: 'cus_test123'
      });

      await subscriptionService.createSubscription(userId, 'premium', 'pm_test123');
    });

    it('should return true for existing entitlements', () => {
      expect(subscriptionService.hasEntitlement(userId, 'exclusive_content')).toBe(true);
      expect(subscriptionService.hasEntitlement(userId, 'hd_streaming')).toBe(true);
    });

    it('should return false for non-existing entitlements', () => {
      expect(subscriptionService.hasEntitlement(userId, 'api_access')).toBe(false);
    });

    it('should return false for user without subscription', () => {
      expect(subscriptionService.hasEntitlement('nonexistent_user', 'basic_content')).toBe(false);
    });
  });

  describe('Subscription Retrieval', () => {
    let userId;
    let subscriptions;

    beforeEach(async () => {
      // Use a unique user ID for this test group
      userId = 'user_retrieval_' + Math.random().toString(36).substr(2, 9);
      subscriptionService.createUser({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        paymentCustomerId: 'cus_test123'
      });

      await subscriptionService.createSubscription(userId, 'free');
      // Don't create a second subscription since it's not allowed
      subscriptions = subscriptionService.getUserSubscriptions(userId);
    });

    it('should get all user subscriptions', () => {
      expect(subscriptions).toHaveLength(1);
      expect(subscriptions[0].userId).toBe(userId);
    });

    it('should get active subscription', () => {
      const activeSubscription = subscriptionService.getActiveSubscription(userId);
      expect(activeSubscription).toBeDefined();
      expect(activeSubscription.isActive()).toBe(true);
    });
  });

  describe('Subscription States', () => {
    let subscription;

    beforeEach(() => {
      subscription = new Subscription({
        userId: 'user_123',
        planId: 'premium',
        status: 'active',
        entitlements: ['exclusive_content']
      });
    });

    it('should identify active subscription', () => {
      expect(subscription.isActive()).toBe(true);
    });

    it('should identify trial subscription', () => {
      subscription.status = 'trialing';
      subscription.trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      expect(subscription.isInTrial()).toBe(true);
    });

    it('should identify expired subscription', () => {
      subscription.currentPeriodEnd = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      expect(subscription.isExpired()).toBe(true);
    });

    it('should check entitlements', () => {
      expect(subscription.hasEntitlement('exclusive_content')).toBe(true);
      expect(subscription.hasEntitlement('api_access')).toBe(false);
    });

    it('should extend subscription', () => {
      const originalEnd = new Date(subscription.currentPeriodEnd);
      // Simulate time passing
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000); // Advance 1 second
      
      subscription.extendSubscription();
      expect(subscription.currentPeriodEnd).toBeInstanceOf(Date);
      expect(subscription.currentPeriodEnd.getTime()).toBeGreaterThan(originalEnd.getTime());
      
      jest.useRealTimers();
    });
  });
});