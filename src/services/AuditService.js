const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create audit logger
const auditLogger = winston.createLogger({
  level: process.env.AUDIT_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'subscriptions-audit' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'audit.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

class AuditService {
  static logUserAction(userId, action, resource, details = {}) {
    auditLogger.info('User action', {
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logSubscriptionChange(userId, subscriptionId, changeType, oldValue, newValue, details = {}) {
    auditLogger.info('Subscription change', {
      userId,
      subscriptionId,
      changeType,
      oldValue,
      newValue,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logPaymentEvent(userId, subscriptionId, eventType, paymentData, details = {}) {
    auditLogger.info('Payment event', {
      userId,
      subscriptionId,
      eventType,
      paymentData,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logAccessAttempt(userId, resource, granted, reason = '', details = {}) {
    auditLogger.info('Access attempt', {
      userId,
      resource,
      granted,
      reason,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logWebhookEvent(provider, eventType, processed, error = null, details = {}) {
    auditLogger.info('Webhook event', {
      provider,
      eventType,
      processed,
      error,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logSystemEvent(eventType, details = {}) {
    auditLogger.info('System event', {
      eventType,
      details,
      timestamp: new Date().toISOString()
    });
  }

  static logError(error, context = {}) {
    auditLogger.error('System error', {
      error: {
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = { AuditService, auditLogger };