const { v4: uuidv4 } = require('uuid');

class Entitlement {
  constructor({ id, name, description, feature, requiredTier }) {
    this.id = id || uuidv4();
    this.name = name;
    this.description = description;
    this.feature = feature; // The actual feature/resource this entitlement grants access to
    this.requiredTier = requiredTier; // 'freemium', 'premium', 'enterprise'
    this.createdAt = new Date();
  }

  static get BASIC_CONTENT() {
    return new Entitlement({
      id: 'basic_content',
      name: 'Basic Content Access',
      description: 'Access to public Allan Rayman content',
      feature: 'content.basic',
      requiredTier: 'freemium'
    });
  }

  static get EXCLUSIVE_CONTENT() {
    return new Entitlement({
      id: 'exclusive_content',
      name: 'Exclusive Content',
      description: 'Access to exclusive tracks and behind-the-scenes content',
      feature: 'content.exclusive',
      requiredTier: 'premium'
    });
  }

  static get HD_STREAMING() {
    return new Entitlement({
      id: 'hd_streaming',
      name: 'HD Streaming',
      description: 'High-quality audio streaming',
      feature: 'streaming.hd',
      requiredTier: 'premium'
    });
  }

  static get EARLY_ACCESS() {
    return new Entitlement({
      id: 'early_access',
      name: 'Early Access',
      description: 'Access to new releases before general public',
      feature: 'releases.early',
      requiredTier: 'premium'
    });
  }

  static get API_ACCESS() {
    return new Entitlement({
      id: 'api_access',
      name: 'API Access',
      description: 'Programmatic access to Allan Rayman content',
      feature: 'api.access',
      requiredTier: 'enterprise'
    });
  }

  static get PRIORITY_SUPPORT() {
    return new Entitlement({
      id: 'priority_support',
      name: 'Priority Support',
      description: 'Priority customer support',
      feature: 'support.priority',
      requiredTier: 'enterprise'
    });
  }
}

module.exports = Entitlement;