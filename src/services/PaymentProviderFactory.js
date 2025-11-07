const PaymentProvider = require('./PaymentProvider');

class PaymentProviderFactory {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, providerClass) {
    this.providers.set(name, providerClass);
  }

  createProvider(name, config) {
    const ProviderClass = this.providers.get(name);
    if (!ProviderClass) {
      throw new Error(`Payment provider '${name}' is not registered`);
    }
    return new ProviderClass(config);
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
}

// Create singleton instance
const factory = new PaymentProviderFactory();

// Register built-in providers
const StripeProvider = require('./StripeProvider');
factory.registerProvider('stripe', StripeProvider);

module.exports = factory;