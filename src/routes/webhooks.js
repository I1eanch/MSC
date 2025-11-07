const express = require('express');
const WebhookController = require('../controllers/WebhookController');

function createWebhookRoutes(subscriptionService, paymentProviderFactory) {
  const router = express.Router();
  const controller = new WebhookController(subscriptionService, paymentProviderFactory);

  // Stripe webhooks
  router.post('/stripe', controller.handleStripeWebhook.bind(controller));

  // Generic webhooks for other providers
  router.post('/:provider', controller.handleGenericWebhook.bind(controller));

  return router;
}

module.exports = createWebhookRoutes;