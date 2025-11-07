const { v4: uuidv4 } = require('uuid');

class SubscriptionPlan {
  constructor({ id, name, description, price, interval, features, tier }) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.price = price;
    this.interval = interval; // 'month' | 'year'
    this.features = features || [];
    this.tier = tier; // 'freemium' | 'premium' | 'enterprise'
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  static get FREE_PLAN() {
    return new SubscriptionPlan({
      id: 'free',
      name: 'Free',
      description: 'Basic access to Allan Rayman content',
      price: 0,
      interval: 'month',
      tier: 'freemium',
      features: ['basic_content', 'public_music']
    });
  }

  static get PREMIUM_PLAN() {
    return new SubscriptionPlan({
      id: 'premium',
      name: 'Premium',
      description: 'Full access to exclusive content and features',
      price: 9.99,
      interval: 'month',
      tier: 'premium',
      features: ['basic_content', 'public_music', 'exclusive_content', 'early_access', 'hd_streaming']
    });
  }

  static get ENTERPRISE_PLAN() {
    return new SubscriptionPlan({
      id: 'enterprise',
      name: 'Enterprise',
      description: 'All features plus premium support',
      price: 29.99,
      interval: 'month',
      tier: 'premium',
      features: ['basic_content', 'public_music', 'exclusive_content', 'early_access', 'hd_streaming', 'api_access', 'priority_support']
    });
  }
}

module.exports = SubscriptionPlan;