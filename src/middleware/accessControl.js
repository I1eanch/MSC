const { AuditService } = require('../services/AuditService');

class AccessControlMiddleware {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  // Middleware to check if user has specific entitlement
  requireEntitlement(entitlement) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          AuditService.logAccessAttempt(null, req.path, false, 'No user authenticated');
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasAccess = this.subscriptionService.hasEntitlement(userId, entitlement);
        
        AuditService.logAccessAttempt(
          userId,
          req.path,
          hasAccess,
          hasAccess ? 'Granted' : `Missing entitlement: ${entitlement}`
        );

        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'Access denied',
            requiredEntitlement: entitlement
          });
        }

        // Add subscription info to request
        req.subscription = this.subscriptionService.getActiveSubscription(userId);
        next();
      } catch (error) {
        AuditService.logError(error, { userId: req.user?.id, path: req.path });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Middleware to check if user has any of the specified entitlements
  requireAnyEntitlement(entitlements) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          AuditService.logAccessAttempt(null, req.path, false, 'No user authenticated');
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasAccess = entitlements.some(entitlement => 
          this.subscriptionService.hasEntitlement(userId, entitlement)
        );
        
        AuditService.logAccessAttempt(
          userId,
          req.path,
          hasAccess,
          hasAccess ? 'Granted' : `Missing one of entitlements: ${entitlements.join(', ')}`
        );

        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'Access denied',
            requiredEntitlements: entitlements
          });
        }

        req.subscription = this.subscriptionService.getActiveSubscription(userId);
        next();
      } catch (error) {
        AuditService.logError(error, { userId: req.user?.id, path: req.path });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Middleware to check if user has active subscription
  requireActiveSubscription() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          AuditService.logAccessAttempt(null, req.path, false, 'No user authenticated');
          return res.status(401).json({ error: 'Authentication required' });
        }

        const subscription = this.subscriptionService.getActiveSubscription(userId);
        const hasAccess = subscription && subscription.isActive() && !subscription.isExpired();
        
        AuditService.logAccessAttempt(
          userId,
          req.path,
          hasAccess,
          hasAccess ? 'Active subscription found' : 'No active subscription'
        );

        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'Active subscription required',
            subscriptionStatus: subscription ? subscription.status : 'none'
          });
        }

        req.subscription = subscription;
        next();
      } catch (error) {
        AuditService.logError(error, { userId: req.user?.id, path: req.path });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Middleware to check if user is in trial period
  requireTrialOrSubscription() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const subscription = this.subscriptionService.getActiveSubscription(userId);
        const hasAccess = subscription && (subscription.isActive() || subscription.isInTrial());
        
        AuditService.logAccessAttempt(
          userId,
          req.path,
          hasAccess,
          hasAccess ? 'Trial or active subscription found' : 'No valid subscription'
        );

        if (!hasAccess) {
          return res.status(403).json({ 
            error: 'Trial or active subscription required',
            subscriptionStatus: subscription ? subscription.status : 'none'
          });
        }

        req.subscription = subscription;
        next();
      } catch (error) {
        AuditService.logError(error, { userId: req.user?.id, path: req.path });
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  // Middleware to add subscription info to request (doesn't block access)
  addSubscriptionInfo() {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        if (userId) {
          req.subscription = this.subscriptionService.getActiveSubscription(userId);
          req.entitlements = req.subscription ? req.subscription.entitlements : [];
        }
        next();
      } catch (error) {
        AuditService.logError(error, { userId: req.user?.id, path: req.path });
        next(); // Don't block, just log error
      }
    };
  }
}

module.exports = AccessControlMiddleware;