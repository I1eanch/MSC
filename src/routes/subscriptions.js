const express = require('express');
const SubscriptionController = require('../controllers/SubscriptionController');

function createSubscriptionRoutes(subscriptionService, authMiddleware) {
  const router = express.Router();
  const controller = new SubscriptionController(subscriptionService, authMiddleware);

  // Get available plans (public)
  router.get('/plans', controller.getPlans.bind(controller));

  // Authenticated routes
  router.use(authMiddleware.authenticate());

  // Get current user's subscription
  router.get('/current', controller.getCurrentSubscription.bind(controller));

  // Get all user subscriptions
  router.get('/my-subscriptions', controller.getUserSubscriptions.bind(controller));

  // Create new subscription
  router.post('/', controller.createSubscription.bind(controller));

  // Cancel subscription
  router.delete('/:subscriptionId', controller.cancelSubscription.bind(controller));

  // Check entitlements
  router.post('/check-entitlements', controller.checkEntitlements.bind(controller));

  return router;
}

module.exports = createSubscriptionRoutes;