const request = require('supertest');
const SubscriptionService = require('../../src/services/SubscriptionService');
const PaymentProviderFactory = require('../../src/services/PaymentProviderFactory');
const { AuditService } = require('../../src/services/AuditService');

// Mock payment provider
class MockPaymentProvider {
  constructor(config) {
    this.config = config;
  }

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

  verifyWebhookSignature(payload, signature, secret) {
    return { type: 'test.event', data: JSON.parse(payload) };
  }

  parseWebhookEvent(event) {
    return {
      type: event.type,
      data: event.data,
      id: 'evt_test123',
      created: Date.now()
    };
  }
}

describe('Webhook Handlers', () => {
  let subscriptionService;
  let paymentProviderFactory;
  let app;

  beforeEach(() => {
    // Create subscription service with mock provider
    const mockProvider = new MockPaymentProvider({});
    subscriptionService = new SubscriptionService(mockProvider);

    // Create test user and subscription
    const testUser = {
      id: 'test_user_123',
      email: 'test@example.com',
      name: 'Test User',
      paymentCustomerId: 'cus_test123'
    };
    subscriptionService.createUser(testUser);

    // Create a test subscription
    const subscription = subscriptionService.createSubscription(
      testUser.id,
      'premium',
      'pm_test123'
    );
    subscription.providerId = 'sub_test123';
  });

  describe('Payment Success Webhook', () => {
    it('should handle payment succeeded event', async () => {
      const eventData = {
        subscription: 'sub_test123',
        payment_intent: 'pi_test123'
      };

      await subscriptionService.handleWebhookEvent('invoice.payment_succeeded', eventData);

      const subscription = subscriptionService.findSubscriptionByProviderId('sub_test123');
      expect(subscription.status).toBe('active');
      expect(subscription.currentPeriodEnd).toBeInstanceOf(Date);
    });

    it('should log payment succeeded event', async () => {
      const auditSpy = jest.spyOn(AuditService, 'logPaymentEvent');
      
      const eventData = {
        subscription: 'sub_test123',
        payment_intent: 'pi_test123'
      };

      await subscriptionService.handleWebhookEvent('invoice.payment_succeeded', eventData);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'payment_succeeded',
        eventData
      );
    });
  });

  describe('Payment Failed Webhook', () => {
    it('should handle payment failed event', async () => {
      const eventData = {
        subscription: 'sub_test123',
        payment_intent: 'pi_test123'
      };

      await subscriptionService.handleWebhookEvent('invoice.payment_failed', eventData);

      const subscription = subscriptionService.findSubscriptionByProviderId('sub_test123');
      expect(subscription.status).toBe('past_due');
    });

    it('should log payment failed event', async () => {
      const auditSpy = jest.spyOn(AuditService, 'logPaymentEvent');
      
      const eventData = {
        subscription: 'sub_test123',
        payment_intent: 'pi_test123'
      };

      await subscriptionService.handleWebhookEvent('invoice.payment_failed', eventData);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'payment_failed',
        eventData
      );
    });
  });

  describe('Subscription Deleted Webhook', () => {
    it('should handle subscription deleted event', async () => {
      const eventData = {
        id: 'sub_test123'
      };

      await subscriptionService.handleWebhookEvent('customer.subscription.deleted', eventData);

      const subscription = subscriptionService.findSubscriptionByProviderId('sub_test123');
      expect(subscription.status).toBe('canceled');
    });

    it('should log subscription deletion', async () => {
      const auditSpy = jest.spyOn(AuditService, 'logSubscriptionChange');
      
      const eventData = {
        id: 'sub_test123'
      };

      await subscriptionService.handleWebhookEvent('customer.subscription.deleted', eventData);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'deleted',
        null,
        null
      );
    });
  });

  describe('Subscription Updated Webhook', () => {
    it('should handle subscription updated event', async () => {
      const eventData = {
        id: 'sub_test123',
        status: 'trialing'
      };

      await subscriptionService.handleWebhookEvent('customer.subscription.updated', eventData);

      const subscription = subscriptionService.findSubscriptionByProviderId('sub_test123');
      expect(subscription.status).toBe('trialing');
    });

    it('should log subscription update', async () => {
      const auditSpy = jest.spyOn(AuditService, 'logSubscriptionChange');
      
      const eventData = {
        id: 'sub_test123',
        status: 'trialing'
      };

      await subscriptionService.handleWebhookEvent('customer.subscription.updated', eventData);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        'webhook_updated',
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('Unknown Event Type', () => {
    it('should log unknown event types', async () => {
      const auditSpy = jest.spyOn(AuditService, 'logWebhookEvent');
      
      const eventData = {
        subscription: 'sub_test123'
      };

      await subscriptionService.handleWebhookEvent('unknown.event', eventData);

      expect(auditSpy).toHaveBeenCalledWith(
        'stripe',
        'unknown.event',
        false,
        null,
        expect.objectContaining({
          message: 'Unhandled event type'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle webhook processing errors gracefully', async () => {
      // Mock a scenario where webhook processing fails
      const originalMethod = subscriptionService.findSubscriptionByProviderId;
      subscriptionService.findSubscriptionByProviderId = jest.fn().mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const auditSpy = jest.spyOn(AuditService, 'logWebhookEvent');
      
      const eventData = {
        subscription: 'sub_test123'
      };

      await expect(
        subscriptionService.handleWebhookEvent('invoice.payment_succeeded', eventData)
      ).rejects.toThrow();

      expect(auditSpy).toHaveBeenCalledWith(
        'stripe',
        'invoice.payment_succeeded',
        false,
        expect.any(String)
      );

      // Restore original method
      subscriptionService.findSubscriptionByProviderId = originalMethod;
    });
  });
});