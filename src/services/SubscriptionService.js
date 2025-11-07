const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Entitlement = require('../models/Entitlement');
const { AuditService } = require('./AuditService');

class SubscriptionService {
  constructor(paymentProvider) {
    this.paymentProvider = paymentProvider;
    // In-memory storage for demo purposes
    // In production, this would be a database
    this.subscriptions = new Map();
    this.users = new Map();
    this.initializeDefaultPlans();
  }

  initializeDefaultPlans() {
    this.plans = new Map([
      ['free', SubscriptionPlan.FREE_PLAN],
      ['premium', SubscriptionPlan.PREMIUM_PLAN],
      ['enterprise', SubscriptionPlan.ENTERPRISE_PLAN]
    ]);
  }

  async createSubscription(userId, planId, paymentMethodId = null) {
    try {
      const plan = this.plans.get(planId);
      if (!plan) {
        throw new Error(`Plan ${planId} not found`);
      }

      // Check if user already has an active subscription
      const existingSubscription = this.getActiveSubscription(userId);
      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      let subscription;
      
      if (plan.price === 0) {
        // Create free subscription directly
        subscription = new Subscription({
          userId,
          planId,
          status: 'active',
          entitlements: plan.features
        });
      } else {
        // Create paid subscription via payment provider
        if (!paymentMethodId) {
          throw new Error('Payment method required for paid subscription');
        }

        const user = this.getUser(userId);
        const paymentSubscription = await this.paymentProvider.createSubscription(
          user.paymentCustomerId,
          planId,
          paymentMethodId
        );

        subscription = new Subscription({
          userId,
          planId,
          status: paymentSubscription.status === 'trialing' ? 'trialing' : 'active',
          currentPeriodStart: new Date(paymentSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(paymentSubscription.current_period_end * 1000),
          trialEnd: paymentSubscription.trial_end ? new Date(paymentSubscription.trial_end * 1000) : null,
          entitlements: plan.features
        });

        subscription.providerId = paymentSubscription.id;
      }

      this.subscriptions.set(subscription.id, subscription);
      
      AuditService.logSubscriptionChange(
        userId,
        subscription.id,
        'created',
        null,
        { planId, status: subscription.status }
      );

      return subscription;
    } catch (error) {
      AuditService.logError(error, { userId, planId });
      throw error;
    }
  }

  async cancelSubscription(userId, subscriptionId) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription || subscription.userId !== userId) {
        throw new Error('Subscription not found');
      }

      if (subscription.providerId) {
        await this.paymentProvider.cancelSubscription(subscription.providerId);
      }

      subscription.cancel();
      this.subscriptions.set(subscriptionId, subscription);

      AuditService.logSubscriptionChange(
        userId,
        subscriptionId,
        'canceled',
        false,
        true
      );

      return subscription;
    } catch (error) {
      AuditService.logError(error, { userId, subscriptionId });
      throw error;
    }
  }

  async updateSubscription(userId, subscriptionId, updateData) {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription || subscription.userId !== userId) {
        throw new Error('Subscription not found');
      }

      const oldStatus = subscription.status;
      
      if (updateData.status) {
        subscription.updateStatus(updateData.status);
      }

      if (updateData.planId) {
        const newPlan = this.plans.get(updateData.planId);
        if (newPlan) {
          subscription.planId = updateData.planId;
          subscription.entitlements = newPlan.features;
        }
      }

      this.subscriptions.set(subscriptionId, subscription);

      AuditService.logSubscriptionChange(
        userId,
        subscriptionId,
        'updated',
        { status: oldStatus },
        { status: subscription.status, planId: subscription.planId }
      );

      return subscription;
    } catch (error) {
      AuditService.logError(error, { userId, subscriptionId });
      throw error;
    }
  }

  getSubscription(subscriptionId) {
    return this.subscriptions.get(subscriptionId);
  }

  getActiveSubscription(userId) {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.userId === userId && subscription.isActive() && !subscription.isExpired()) {
        return subscription;
      }
    }
    return null;
  }

  getUserSubscriptions(userId) {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.userId === userId
    );
  }

  hasEntitlement(userId, entitlement) {
    const subscription = this.getActiveSubscription(userId);
    return !!(subscription && subscription.hasEntitlement(entitlement));
  }

  async handleWebhookEvent(eventType, eventData) {
    try {
      switch (eventType) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(eventData);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(eventData);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(eventData);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(eventData);
          break;
        default:
          AuditService.logWebhookEvent('stripe', eventType, false, null, { message: 'Unhandled event type' });
      }
    } catch (error) {
      AuditService.logWebhookEvent('stripe', eventType, false, error.message);
      throw error;
    }
  }

  async handlePaymentSucceeded(eventData) {
    const subscriptionId = eventData.subscription;
    const subscription = this.findSubscriptionByProviderId(subscriptionId);
    
    if (subscription) {
      subscription.extendSubscription();
      this.subscriptions.set(subscription.id, subscription);
      
      AuditService.logPaymentEvent(
        subscription.userId,
        subscription.id,
        'payment_succeeded',
        eventData
      );
    }
  }

  async handlePaymentFailed(eventData) {
    const subscriptionId = eventData.subscription;
    const subscription = this.findSubscriptionByProviderId(subscriptionId);
    
    if (subscription) {
      subscription.updateStatus('past_due');
      this.subscriptions.set(subscription.id, subscription);
      
      AuditService.logPaymentEvent(
        subscription.userId,
        subscription.id,
        'payment_failed',
        eventData
      );
    }
  }

  async handleSubscriptionDeleted(eventData) {
    const subscriptionId = eventData.id;
    const subscription = this.findSubscriptionByProviderId(subscriptionId);
    
    if (subscription) {
      subscription.updateStatus('canceled');
      this.subscriptions.set(subscription.id, subscription);
      
      AuditService.logSubscriptionChange(
        subscription.userId,
        subscription.id,
        'deleted',
        null,
        null
      );
    }
  }

  async handleSubscriptionUpdated(eventData) {
    const subscriptionId = eventData.id;
    const subscription = this.findSubscriptionByProviderId(subscriptionId);
    
    if (subscription) {
      const oldStatus = subscription.status;
      subscription.updateStatus(eventData.status);
      this.subscriptions.set(subscription.id, subscription);
      
      AuditService.logSubscriptionChange(
        subscription.userId,
        subscription.id,
        'webhook_updated',
        { status: oldStatus },
        { status: eventData.status }
      );
    }
  }

  findSubscriptionByProviderId(providerId) {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.providerId === providerId) {
        return subscription;
      }
    }
    return null;
  }

  // Helper methods for user management (simplified for demo)
  createUser(userData) {
    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      paymentCustomerId: userData.paymentCustomerId,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getPlans() {
    return Array.from(this.plans.values());
  }

  getPlan(planId) {
    return this.plans.get(planId);
  }
}

module.exports = SubscriptionService;