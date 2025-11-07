const { AuditService } = require('../services/AuditService');

class WebhookController {
  constructor(subscriptionService, paymentProviderFactory) {
    this.subscriptionService = subscriptionService;
    this.paymentProviderFactory = paymentProviderFactory;
  }

  // Handle Stripe webhooks
  async handleStripeWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      const payload = req.body;
      
      if (!signature) {
        AuditService.logWebhookEvent('stripe', 'unknown', false, 'Missing signature');
        return res.status(400).json({ error: 'Missing signature' });
      }

      const stripeProvider = this.paymentProviderFactory.createProvider('stripe', {
        secretKey: process.env.STRIPE_SECRET_KEY
      });

      try {
        const event = stripeProvider.verifyWebhookSignature(
          payload,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );

        const eventData = stripeProvider.parseWebhookEvent(event);
        
        await this.subscriptionService.handleWebhookEvent(eventData.type, eventData.data);

        AuditService.logWebhookEvent('stripe', eventData.type, true, null, {
          eventId: event.id
        });

        res.json({ received: true });
      } catch (signatureError) {
        AuditService.logWebhookEvent('stripe', 'unknown', false, 'Invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      AuditService.logError(error, { action: 'handleStripeWebhook' });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  // Handle generic webhooks (for other providers)
  async handleGenericWebhook(req, res) {
    try {
      const { provider } = req.params;
      const signature = req.headers['x-signature'] || req.headers['webhook-signature'];
      const payload = req.body;

      if (!provider) {
        return res.status(400).json({ error: 'Provider parameter is required' });
      }

      try {
        const paymentProvider = this.paymentProviderFactory.createProvider(provider, {
          // Provider-specific config would come from environment
        });

        if (signature && paymentProvider.verifyWebhookSignature) {
          paymentProvider.verifyWebhookSignature(
            payload,
            signature,
            process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`]
          );
        }

        const eventData = paymentProvider.parseWebhookEvent(payload);
        
        await this.subscriptionService.handleWebhookEvent(eventData.type, eventData.data);

        AuditService.logWebhookEvent(provider, eventData.type, true, null, {
          eventId: eventData.id
        });

        res.json({ received: true });
      } catch (providerError) {
        AuditService.logWebhookEvent(provider, 'unknown', false, providerError.message);
        return res.status(400).json({ error: 'Webhook verification failed' });
      }
    } catch (error) {
      AuditService.logError(error, { action: 'handleGenericWebhook' });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}

module.exports = WebhookController;