# Allan Rayman Subscriptions Backend

A comprehensive subscription management backend for Allan Rayman's portfolio website, featuring tiered access control, payment processing, and audit trails.

## Features

- **Subscription Management**: Freemium, Premium, and Enterprise tiers
- **Payment Provider Abstraction**: Stripe integration with extensible provider system
- **Access Control Middleware**: Feature gating based on subscription entitlements
- **Webhook Handlers**: Automated subscription state management
- **Audit Trail**: Comprehensive logging of all subscription and access events
- **Content Delivery**: Tiered content access with streaming support

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

## API Endpoints

### Authentication
- `POST /api/auth/login` - Mock authentication for testing

### Subscriptions
- `GET /api/subscriptions/plans` - Get available subscription plans
- `GET /api/subscriptions/current` - Get current user subscription
- `POST /api/subscriptions` - Create new subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription
- `POST /api/subscriptions/check-entitlements` - Check user entitlements

### Content
- `GET /api/content/basic` - Get basic content (public)
- `GET /api/content/premium` - Get premium content (requires subscription)
- `GET /api/content/enterprise` - Get enterprise content (requires enterprise subscription)
- `GET /api/content/item/:id` - Get specific content item
- `GET /api/content/stream/audio/:id` - Stream audio content

### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `POST /api/webhooks/:provider` - Handle generic provider webhooks

## Subscription Plans

### Free (Freemium)
- Price: $0/month
- Features: Basic content access, public music
- Entitlements: `basic_content`, `public_music`

### Premium
- Price: $9.99/month
- Features: All free features plus exclusive content, early access, HD streaming
- Entitlements: `basic_content`, `public_music`, `exclusive_content`, `early_access`, `hd_streaming`

### Enterprise
- Price: $29.99/month
- Features: All premium features plus API access and priority support
- Entitlements: All premium entitlements plus `api_access`, `priority_support`

## Architecture

### Domain Models
- **SubscriptionPlan**: Defines subscription tiers and features
- **Subscription**: Manages user subscription state and periods
- **Entitlement**: Represents specific feature access rights

### Services
- **SubscriptionService**: Core subscription logic and state management
- **PaymentProvider**: Abstract payment processing interface
- **StripeProvider**: Stripe payment implementation
- **AuditService**: Comprehensive logging and audit trails

### Middleware
- **AuthMiddleware**: JWT-based authentication
- **AccessControlMiddleware**: Feature gating and entitlement checking

### Controllers
- **SubscriptionController**: Subscription CRUD operations
- **WebhookController**: Payment provider webhook handling
- **ContentController**: Tiered content delivery

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage
- Webhook handler processing
- Subscription state management
- Access control middleware
- Authentication flows
- Error handling scenarios

## Payment Provider Integration

### Stripe Configuration
1. Set up Stripe account and API keys
2. Configure webhook endpoints in Stripe dashboard
3. Add prices/products for subscription plans
4. Test with Stripe CLI or test cards

### Webhook Events Handled
- `invoice.payment_succeeded` - Subscription renewal
- `invoice.payment_failed` - Payment failure handling
- `customer.subscription.deleted` - Cancellation processing
- `customer.subscription.updated` - Status updates

## Audit Logging

All significant events are logged with:
- User identification
- Action performed
- Resource accessed
- Timestamp
- Success/failure status
- Additional context

Audit logs are stored in `logs/audit.log` with rotation.

## Security Features

- JWT-based authentication
- Request validation and sanitization
- Rate limiting ready (implementation optional)
- CORS configuration
- Helmet.js security headers
- Webhook signature verification

## Deployment Considerations

### Environment Variables
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `STRIPE_SECRET_KEY` - Stripe API secret
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

### Production Setup
1. Use a real database (PostgreSQL, MongoDB, etc.)
2. Configure proper secrets management
3. Set up monitoring and alerting
4. Configure backup and disaster recovery
5. Implement proper SSL/TLS
6. Set up log aggregation

## Extending the System

### Adding New Payment Providers
1. Extend `PaymentProvider` base class
2. Implement required methods
3. Register with `PaymentProviderFactory`
4. Add webhook handling

### Adding New Subscription Tiers
1. Define new plan in `SubscriptionPlan` model
2. Add corresponding entitlements
3. Update access control rules
4. Test feature gating

### Custom Entitlements
1. Define entitlement in `Entitlement` model
2. Add to appropriate subscription plans
3. Implement access control middleware
4. Update content delivery logic

## Development Workflow

1. Feature development on feature branches
2. Comprehensive testing including edge cases
3. Code review focusing on security and performance
4. Integration testing with payment providers
5. Audit trail verification
6. Documentation updates

## License

MIT License - see LICENSE file for details.