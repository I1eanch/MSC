const stripe = require('stripe');
const PaymentProvider = require('./PaymentProvider');

class StripeProvider extends PaymentProvider {
  constructor(config) {
    super(config);
    this.stripe = stripe(config.secretKey);
  }

  async createCustomer(customerData) {
    try {
      const customer = await this.stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: customerData.metadata || {}
      });
      return customer;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  async createSubscription(customerId, planId, paymentMethodId) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to create Stripe subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel Stripe subscription: ${error.message}`);
    }
  }

  async updateSubscription(subscriptionId, updateData) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, updateData);
      return subscription;
    } catch (error) {
      throw new Error(`Failed to update Stripe subscription: ${error.message}`);
    }
  }

  async retrieveSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      throw new Error(`Failed to retrieve Stripe subscription: ${error.message}`);
    }
  }

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        automatic_payment_methods: { enabled: true }
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create Stripe payment intent: ${error.message}`);
    }
  }

  async refundPayment(paymentIntentId) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId
      });
      return refund;
    } catch (error) {
      throw new Error(`Failed to refund Stripe payment: ${error.message}`);
    }
  }

  verifyWebhookSignature(payload, signature, secret) {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new Error(`Invalid Stripe webhook signature: ${error.message}`);
    }
  }

  parseWebhookEvent(event) {
    return {
      type: event.type,
      data: event.data,
      id: event.id,
      created: event.created
    };
  }
}

module.exports = StripeProvider;