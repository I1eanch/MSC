#!/usr/bin/env node

/**
 * Demo script to test the subscriptions backend functionality
 * This script demonstrates:
 * 1. User authentication
 * 2. Subscription creation
 * 3. Entitlement checking
 * 4. Content access based on subscription
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

class SubscriptionDemo {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 5000
    });
    this.token = null;
    this.user = null;
  }

  async healthCheck() {
    console.log('🔍 Checking server health...');
    try {
      const response = await this.client.get('/health');
      console.log('✅ Server is healthy');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Version: ${response.data.version}`);
      return true;
    } catch (error) {
      console.log('❌ Server is not responding');
      console.log(`   Error: ${error.message}`);
      return false;
    }
  }

  async authenticate(email = 'demo@allanrayman.com', password = 'demo123') {
    console.log('\n🔐 Authenticating user...');
    try {
      const response = await this.client.post('/api/auth/login', {
        email,
        password
      });
      
      this.token = response.data.token;
      this.user = response.data.user;
      
      // Set authorization header for future requests
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      
      console.log('✅ Authentication successful');
      console.log(`   User ID: ${this.user.id}`);
      console.log(`   Email: ${this.user.email}`);
      return true;
    } catch (error) {
      console.log('❌ Authentication failed');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return false;
    }
  }

  async getPlans() {
    console.log('\n📋 Fetching subscription plans...');
    try {
      const response = await this.client.get('/api/subscriptions/plans');
      console.log('✅ Plans retrieved successfully');
      
      response.data.plans.forEach(plan => {
        console.log(`\n📦 ${plan.name} Plan`);
        console.log(`   ID: ${plan.id}`);
        console.log(`   Price: $${plan.price}/${plan.interval}`);
        console.log(`   Tier: ${plan.tier}`);
        console.log(`   Features: ${plan.features.join(', ')}`);
      });
      
      return response.data.plans;
    } catch (error) {
      console.log('❌ Failed to fetch plans');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }

  async createSubscription(planId = 'free') {
    console.log(`\n💳 Creating subscription for plan: ${planId}...`);
    try {
      const response = await this.client.post('/api/subscriptions', {
        planId,
        paymentMethodId: planId !== 'free' ? 'pm_test_demo' : undefined
      });
      
      console.log('✅ Subscription created successfully');
      const subscription = response.data.subscription;
      console.log(`   Subscription ID: ${subscription.id}`);
      console.log(`   Plan: ${subscription.planId}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Entitlements: ${subscription.entitlements.join(', ')}`);
      
      return subscription;
    } catch (error) {
      console.log('❌ Failed to create subscription');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }

  async checkEntitlements(entitlements = ['basic_content', 'exclusive_content', 'api_access']) {
    console.log('\n🔍 Checking entitlements...');
    try {
      const response = await this.client.post('/api/subscriptions/check-entitlements', {
        entitlements
      });
      
      console.log('✅ Entitlement check completed');
      Object.entries(response.data.entitlements).forEach(([entitlement, hasAccess]) => {
        const status = hasAccess ? '✅' : '❌';
        console.log(`   ${status} ${entitlement}: ${hasAccess ? 'Granted' : 'Denied'}`);
      });
      
      return response.data.entitlements;
    } catch (error) {
      console.log('❌ Failed to check entitlements');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }

  async accessContent() {
    console.log('\n🎵 Testing content access...');
    
    const contentTests = [
      { path: '/api/content/basic', name: 'Basic Content', shouldSucceed: true },
      { path: '/api/content/premium', name: 'Premium Content', shouldSucceed: false },
      { path: '/api/content/enterprise', name: 'Enterprise Content', shouldSucceed: false }
    ];

    for (const test of contentTests) {
      try {
        const response = await this.client.get(test.path);
        const status = response.status === 200 ? '✅' : '❌';
        const result = response.status === 200 ? 'Accessible' : 'Inaccessible';
        console.log(`   ${status} ${test.name}: ${result}`);
        
        if (response.status === 200 && response.data.content) {
          console.log(`      Items available: ${response.data.content.length}`);
        }
      } catch (error) {
        const status = test.shouldSucceed ? '❌' : '⚠️';
        const result = error.response?.status === 403 ? 'Access Denied' : 'Error';
        console.log(`   ${status} ${test.name}: ${result}`);
        
        if (error.response?.status !== 403) {
          console.log(`      Error: ${error.response?.data?.error || error.message}`);
        }
      }
    }
  }

  async getCurrentSubscription() {
    console.log('\n📊 Fetching current subscription...');
    try {
      const response = await this.client.get('/api/subscriptions/current');
      
      if (response.data.subscription) {
        const sub = response.data.subscription;
        console.log('✅ Active subscription found');
        console.log(`   Plan: ${sub.planName}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Period End: ${new Date(sub.currentPeriodEnd).toLocaleDateString()}`);
        console.log(`   In Trial: ${sub.isInTrial}`);
        console.log(`   Entitlements: ${sub.entitlements.join(', ')}`);
      } else {
        console.log('ℹ️ No active subscription');
      }
      
      return response.data.subscription;
    } catch (error) {
      console.log('❌ Failed to fetch subscription');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }

  async upgradeSubscription() {
    console.log('\n⬆️ Upgrading to premium plan...');
    try {
      // First cancel current subscription
      const currentSub = await this.getCurrentSubscription();
      if (currentSub) {
        await this.client.delete(`/api/subscriptions/${currentSub.id}`);
        console.log('   Previous subscription cancelled');
      }

      // Create new premium subscription
      const response = await this.client.post('/api/subscriptions', {
        planId: 'premium',
        paymentMethodId: 'pm_test_premium'
      });
      
      console.log('✅ Upgraded to premium successfully');
      const subscription = response.data.subscription;
      console.log(`   New Subscription ID: ${subscription.id}`);
      console.log(`   Plan: ${subscription.planId}`);
      console.log(`   Status: ${subscription.status}`);
      
      return subscription;
    } catch (error) {
      console.log('❌ Failed to upgrade subscription');
      console.log(`   Error: ${error.response?.data?.error || error.message}`);
      return null;
    }
  }

  async runDemo() {
    console.log('🚀 Starting Allan Rayman Subscriptions Demo\n');
    
    // Health check
    const isHealthy = await this.healthCheck();
    if (!isHealthy) {
      console.log('\n❌ Demo failed: Server is not running');
      console.log('   Please start the server with: npm run dev');
      return;
    }

    // Authentication
    const isAuthenticated = await this.authenticate();
    if (!isAuthenticated) {
      console.log('\n❌ Demo failed: Authentication failed');
      return;
    }

    // Get available plans
    const plans = await this.getPlans();
    if (!plans) {
      console.log('\n❌ Demo failed: Could not fetch plans');
      return;
    }

    // Create free subscription
    await this.createSubscription('free');

    // Check current subscription
    await this.getCurrentSubscription();

    // Check entitlements
    await this.checkEntitlements();

    // Test content access
    await this.accessContent();

    // Upgrade to premium
    const premiumSub = await this.upgradeSubscription();
    if (premiumSub) {
      // Check entitlements after upgrade
      await this.checkEntitlements();
      
      // Test content access again
      await this.accessContent();
    }

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('   - Explore the API at http://localhost:3000/api');
    console.log('   - Check audit logs in logs/audit.log');
    console.log('   - Run tests with npm test');
    console.log('   - Read the documentation in README.md');
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  const demo = new SubscriptionDemo();
  demo.runDemo().catch(error => {
    console.error('\n💥 Demo failed with error:', error.message);
    process.exit(1);
  });
}

module.exports = SubscriptionDemo;