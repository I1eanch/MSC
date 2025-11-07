class PaymentProvider {
  constructor(config) {
    this.config = config;
  }

  async createCustomer(customerData) {
    throw new Error('createCustomer must be implemented by subclass');
  }

  async createSubscription(customerId, planId, paymentMethodId) {
    throw new Error('createSubscription must be implemented by subclass');
  }

  async cancelSubscription(subscriptionId) {
    throw new Error('cancelSubscription must be implemented by subclass');
  }

  async updateSubscription(subscriptionId, updateData) {
    throw new Error('updateSubscription must be implemented by subclass');
  }

  async retrieveSubscription(subscriptionId) {
    throw new Error('retrieveSubscription must be implemented by subclass');
  }

  async createPaymentIntent(amount, currency = 'usd') {
    throw new Error('createPaymentIntent must be implemented by subclass');
  }

  async refundPayment(paymentIntentId) {
    throw new Error('refundPayment must be implemented by subclass');
  }

  verifyWebhookSignature(payload, signature, secret) {
    throw new Error('verifyWebhookSignature must be implemented by subclass');
  }

  parseWebhookEvent(payload) {
    throw new Error('parseWebhookEvent must be implemented by subclass');
  }
}

module.exports = PaymentProvider;