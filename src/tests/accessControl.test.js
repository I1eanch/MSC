const AccessControlMiddleware = require('../../src/middleware/accessControl');
const SubscriptionService = require('../../src/services/SubscriptionService');

// Mock payment provider
class MockPaymentProvider {
  async createSubscription() {
    return { id: 'sub_test' };
  }
}

describe('Access Control Middleware', () => {
  let accessControl;
  let subscriptionService;
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    subscriptionService = new SubscriptionService(new MockPaymentProvider());
    accessControl = new AccessControlMiddleware(subscriptionService);

    mockReq = {
      user: { id: 'user_123' },
      path: '/api/content/premium'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFunction = jest.fn();

    // Create test user and subscription
    subscriptionService.createUser({
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      paymentCustomerId: 'cus_test123'
    });
  });

  describe('requireEntitlement', () => {
    it('should allow access with valid entitlement', async () => {
      // Create subscription with required entitlement
      await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      
      const middleware = accessControl.requireEntitlement('exclusive_content');
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access without entitlement', async () => {
      // Create free subscription without required entitlement
      await subscriptionService.createSubscription('user_123', 'free');
      
      const middleware = accessControl.requireEntitlement('exclusive_content');
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        requiredEntitlement: 'exclusive_content'
      });
    });

    it('should deny access without authentication', async () => {
      mockReq.user = null;
      
      const middleware = accessControl.requireEntitlement('exclusive_content');
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Authentication required'
      });
    });
  });

  describe('requireAnyEntitlement', () => {
    it('should allow access with one of multiple entitlements', async () => {
      await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      
      const middleware = accessControl.requireAnyEntitlement(['api_access', 'exclusive_content']);
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access without any of the required entitlements', async () => {
      await subscriptionService.createSubscription('user_123', 'free');
      
      const middleware = accessControl.requireAnyEntitlement(['api_access', 'exclusive_content']);
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access denied',
        requiredEntitlements: ['api_access', 'exclusive_content']
      });
    });
  });

  describe('requireActiveSubscription', () => {
    it('should allow access with active subscription', async () => {
      await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      
      const middleware = accessControl.requireActiveSubscription();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should deny access without subscription', async () => {
      const middleware = accessControl.requireActiveSubscription();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Active subscription required',
        subscriptionStatus: 'none'
      });
    });
  });

  describe('requireTrialOrSubscription', () => {
    it('should allow access with trial subscription', async () => {
      const subscription = await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      subscription.status = 'trialing';
      subscription.trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      const middleware = accessControl.requireTrialOrSubscription();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access with active subscription', async () => {
      await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      
      const middleware = accessControl.requireTrialOrSubscription();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('addSubscriptionInfo', () => {
    it('should add subscription info to request', async () => {
      await subscriptionService.createSubscription('user_123', 'premium', 'pm_test123');
      
      const middleware = accessControl.addSubscriptionInfo();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockReq.subscription).toBeDefined();
      expect(mockReq.entitlements).toContain('exclusive_content');
    });

    it('should not fail without user', async () => {
      mockReq.user = null;
      
      const middleware = accessControl.addSubscriptionInfo();
      await middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockReq.subscription).toBeUndefined();
      expect(mockReq.entitlements).toBeUndefined();
    });
  });
});