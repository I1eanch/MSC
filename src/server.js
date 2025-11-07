require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import services and middleware
const PaymentProviderFactory = require('./services/PaymentProviderFactory');
const SubscriptionService = require('./services/SubscriptionService');
const AuthMiddleware = require('./middleware/auth');
const AccessControlMiddleware = require('./middleware/accessControl');

// Import routes
const createSubscriptionRoutes = require('./routes/subscriptions');
const createWebhookRoutes = require('./routes/webhooks');
const createContentRoutes = require('./routes/content');

// Import audit service for logging
const { AuditService } = require('./services/AuditService');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize services
    this.paymentProviderFactory = PaymentProviderFactory;
    this.paymentProvider = this.paymentProviderFactory.createProvider('stripe', {
      secretKey: process.env.STRIPE_SECRET_KEY
    });
    
    this.subscriptionService = new SubscriptionService(this.paymentProvider);
    this.authMiddleware = new AuthMiddleware();
    this.accessControl = new AccessControlMiddleware(this.subscriptionService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      AuditService.logSystemEvent('http_request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/subscriptions', createSubscriptionRoutes(
      this.subscriptionService, 
      this.authMiddleware
    ));
    
    this.app.use('/api/webhooks', createWebhookRoutes(
      this.subscriptionService, 
      this.paymentProviderFactory
    ));
    
    // Content routes with access control
    this.app.use('/api/content', createContentRoutes());
    
    // Apply access control to protected content
    this.app.use('/api/content/premium', 
      this.authMiddleware.authenticate(),
      this.accessControl.requireEntitlement('exclusive_content')
    );
    
    this.app.use('/api/content/enterprise', 
      this.authMiddleware.authenticate(),
      this.accessControl.requireEntitlement('api_access')
    );

    this.app.use('/api/content/stream/audio/:contentId', 
      this.authMiddleware.optionalAuthenticate(),
      this.accessControl.addSubscriptionInfo()
    );

    // Mock user authentication endpoint for testing
    this.app.post('/api/auth/login', (req, res) => {
      const { email, password } = req.body;
      
      // Mock authentication - in production, this would verify against a database
      if (email && password) {
        const mockUser = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0]
        };
        
        // Create user in subscription service
        this.subscriptionService.createUser({
          ...mockUser,
          paymentCustomerId: 'cus_' + Math.random().toString(36).substr(2, 9)
        });
        
        const token = this.authMiddleware.generateToken(mockUser);
        
        AuditService.logUserAction(mockUser.id, 'login', 'auth', { email });
        
        res.json({
          user: mockUser,
          token
        });
      } else {
        res.status(400).json({ error: 'Email and password required' });
      }
    });

    // Serve static files (the original portfolio)
    this.app.use(express.static(path.join(__dirname, '../1_start')));
    
    // Serve main index.html for root route
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../1_start/index.html'));
    });
    
    // API documentation route
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Allan Rayman Subscriptions API',
        version: '1.0.0',
        endpoints: {
          auth: {
            'POST /api/auth/login': 'Mock authentication for testing'
          },
          subscriptions: {
            'GET /api/subscriptions/plans': 'Get available subscription plans',
            'GET /api/subscriptions/current': 'Get current user subscription',
            'POST /api/subscriptions': 'Create new subscription',
            'DELETE /api/subscriptions/:id': 'Cancel subscription',
            'POST /api/subscriptions/check-entitlements': 'Check user entitlements'
          },
          content: {
            'GET /api/content/basic': 'Get basic content (public)',
            'GET /api/content/premium': 'Get premium content (requires subscription)',
            'GET /api/content/enterprise': 'Get enterprise content (requires enterprise subscription)',
            'GET /api/content/item/:id': 'Get specific content item',
            'GET /api/content/stream/audio/:id': 'Stream audio content'
          },
          webhooks: {
            'POST /api/webhooks/stripe': 'Handle Stripe webhooks',
            'POST /api/webhooks/:provider': 'Handle generic provider webhooks'
          }
        }
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      AuditService.logError(error, {
        method: req.method,
        path: req.path,
        userId: req.user?.id
      });
      
      res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      AuditService.logError(new Error('Unhandled Rejection'), { reason, promise });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      AuditService.logError(error, { type: 'uncaughtException' });
      process.exit(1);
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Allan Rayman Subscriptions Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`📚 API docs: http://localhost:${this.port}/api`);
      console.log(`🌐 Frontend: http://localhost:${this.port}/`);
      
      AuditService.logSystemEvent('server_start', {
        port: this.port,
        environment: process.env.NODE_ENV || 'development'
      });
    });
  }
}

// Start the server
const server = new Server();
server.start();

module.exports = server;