const { AuditService } = require('../services/AuditService');

class SubscriptionController {
  constructor(subscriptionService, authMiddleware) {
    this.subscriptionService = subscriptionService;
    this.authMiddleware = authMiddleware;
  }

  // Get available subscription plans
  async getPlans(req, res) {
    try {
      const plans = this.subscriptionService.getPlans();
      res.json({
        plans: plans.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          tier: plan.tier,
          features: plan.features
        }))
      });
    } catch (error) {
      AuditService.logError(error, { action: 'getPlans' });
      res.status(500).json({ error: 'Failed to retrieve plans' });
    }
  }

  // Get current user's subscription
  async getCurrentSubscription(req, res) {
    try {
      const userId = req.user.id;
      const subscription = this.subscriptionService.getActiveSubscription(userId);
      
      if (!subscription) {
        return res.json({ subscription: null });
      }

      const plan = this.subscriptionService.getPlan(subscription.planId);
      
      res.json({
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          planName: plan.name,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          entitlements: subscription.entitlements,
          isInTrial: subscription.isInTrial(),
          isExpired: subscription.isExpired()
        }
      });
    } catch (error) {
      AuditService.logError(error, { userId: req.user.id, action: 'getCurrentSubscription' });
      res.status(500).json({ error: 'Failed to retrieve subscription' });
    }
  }

  // Create new subscription
  async createSubscription(req, res) {
    try {
      const userId = req.user.id;
      const { planId, paymentMethodId } = req.body;

      if (!planId) {
        return res.status(400).json({ error: 'Plan ID is required' });
      }

      const plan = this.subscriptionService.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      if (plan.price > 0 && !paymentMethodId) {
        return res.status(400).json({ error: 'Payment method required for paid plans' });
      }

      const subscription = await this.subscriptionService.createSubscription(
        userId,
        planId,
        paymentMethodId
      );

      AuditService.logUserAction(userId, 'create_subscription', 'subscription', { planId });

      res.status(201).json({
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          entitlements: subscription.entitlements
        }
      });
    } catch (error) {
      AuditService.logError(error, { userId: req.user.id, action: 'createSubscription' });
      res.status(400).json({ error: error.message });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const userId = req.user.id;
      const { subscriptionId } = req.params;

      const subscription = await this.subscriptionService.cancelSubscription(userId, subscriptionId);

      AuditService.logUserAction(userId, 'cancel_subscription', 'subscription', { subscriptionId });

      res.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          currentPeriodEnd: subscription.currentPeriodEnd
        }
      });
    } catch (error) {
      AuditService.logError(error, { userId: req.user.id, action: 'cancelSubscription' });
      res.status(400).json({ error: error.message });
    }
  }

  // Get all user subscriptions
  async getUserSubscriptions(req, res) {
    try {
      const userId = req.user.id;
      const subscriptions = this.subscriptionService.getUserSubscriptions(userId);

      const subscriptionsWithPlans = subscriptions.map(subscription => {
        const plan = this.subscriptionService.getPlan(subscription.planId);
        return {
          id: subscription.id,
          planId: subscription.planId,
          planName: plan.name,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          entitlements: subscription.entitlements,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt
        };
      });

      res.json({ subscriptions: subscriptionsWithPlans });
    } catch (error) {
      AuditService.logError(error, { userId: req.user.id, action: 'getUserSubscriptions' });
      res.status(500).json({ error: 'Failed to retrieve subscriptions' });
    }
  }

  // Check user entitlements
  async checkEntitlements(req, res) {
    try {
      const userId = req.user.id;
      const { entitlements } = req.body;

      if (!entitlements || !Array.isArray(entitlements)) {
        return res.status(400).json({ error: 'Entitlements array is required' });
      }

      const results = {};
      for (const entitlement of entitlements) {
        results[entitlement] = this.subscriptionService.hasEntitlement(userId, entitlement);
      }

      res.json({ entitlements: results });
    } catch (error) {
      AuditService.logError(error, { userId: req.user.id, action: 'checkEntitlements' });
      res.status(500).json({ error: 'Failed to check entitlements' });
    }
  }
}

module.exports = SubscriptionController;