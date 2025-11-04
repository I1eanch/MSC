# ADR 005: Integration Patterns & External Services

**Status**: Accepted

**Date**: 2024

**Context**

The platform integrates with numerous external services including OAuth providers, payment gateways, health tracking platforms, and AI microservices. A consistent integration pattern ensures reliability, maintainability, and proper error handling.

**Decision**

We adopt the following integration patterns for external services:

## Authentication Integrations

### OAuth 2.0 / OpenID Connect Providers

**Supported Providers**:
- Google (international)
- Apple (iOS/web)
- Yandex (Russia)
- VK (Russia, alternative provider)

**Integration Pattern**:

```
Client
  ↓
[OAuth 2.0 Authorization Flow]
  ↓
Auth Service
  ├─ Request token from provider
  ├─ Validate token signature
  ├─ Create/update user in DB
  ├─ Generate JWT token
  └─ Return JWT to client
  ↓
Client stores JWT
```

**Configuration**:

```typescript
const oauthProviders = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    discoveryUrl: 'https://accounts.google.com/.well-known/openid-configuration',
    scopes: ['openid', 'profile', 'email']
  },
  apple: {
    clientId: process.env.APPLE_CLIENT_ID,
    teamId: process.env.APPLE_TEAM_ID,
    keyId: process.env.APPLE_KEY_ID,
    keySecret: process.env.APPLE_KEY_SECRET,
    scopes: ['name', 'email']
  },
  yandex: {
    clientId: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    discoveryUrl: 'https://login.yandex.ru/.well-known/openid-configuration',
    scopes: ['login:email', 'login:info']
  },
  vk: {
    clientId: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_CLIENT_SECRET,
    apiEndpoint: 'https://oauth.vk.com',
    scopes: ['email']
  }
};
```

**Fallback Strategy**:
- Email/password authentication as secondary option
- Rate limiting: 5 login attempts per minute
- Account linking: Connect multiple OAuth accounts to same user

## Payment Integrations

### Primary: Stripe (International)

**Payment Flow**:

```
User checkout
  ↓
Payment Service receives payment intent
  ↓
Create Stripe PaymentIntent
  ↓
Client completes payment (3D Secure if required)
  ↓
Stripe webhook: payment_intent.succeeded
  ↓
Payment Service marks payment as completed
  ├─ Update subscription status
  ├─ Publish payment.completed event
  └─ Trigger downstream services (content unlock, email notification)
```

**Configuration**:

```typescript
const stripeConfig = {
  apiKey: process.env.STRIPE_SECRET_KEY,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  idempotencyKey: `payment_${subscriptionId}_${Date.now()}`, // Prevent duplicates
  timeout: 30000, // 30 second timeout
};
```

**Supported Payment Methods**:
- Credit/debit cards (Visa, Mastercard, Amex, Discover)
- Bank transfers (ACH, SEPA)
- Digital wallets (Apple Pay, Google Pay)

### Secondary: Russian Payment Gateways

#### Yandex.Kassa

**Configuration**:

```typescript
const yandexKassaConfig = {
  shopId: process.env.YANDEX_SHOP_ID,
  scopes: process.env.YANDEX_API_KEY,
  endpoint: 'https://api.yandex.checkout.ru/v3',
  webhookSecret: process.env.YANDEX_WEBHOOK_SECRET,
};
```

**Payment Methods**:
- Bank cards
- QIWI wallet
- Yandex.Money
- Sberbankб Online
- Phone number payment

**Webhook Handling**:

```
Payment completed in Yandex.Kassa
  ↓
Webhook: payment.succeeded
  ↓
Verify webhook signature with secret
  ↓
Update payment status
  ↓
Process subscription/content unlock
```

#### Sberbank Acquiring

**Configuration**:

```typescript
const sberbankConfig = {
  merchantId: process.env.SBERBANK_MERCHANT_ID,
  login: process.env.SBERBANK_LOGIN,
  password: process.env.SBERBANK_PASSWORD,
  endpoint: 'https://securepayments.sberbank.ru/payment/rest',
};
```

**Payment Types**:
- Credit/debit cards (via Sberbank)
- Installment plans (Sberbank installs)
- Bank transfers

#### WebMoney

**Configuration**:

```typescript
const webmoneyConfig = {
  shopId: process.env.WEBMONEY_SHOP_ID,
  secret: process.env.WEBMONEY_SECRET,
  endpoint: 'https://w3s.webmoney.ru',
};
```

**Integration Method**: XML-based API for merchant processing

### Payment Service Orchestration

**Subscription Payment Workflow** (Saga Pattern):

```
1. User initiates purchase
   ↓
2. Create subscription record (status: pending)
   ↓
3. Route to payment gateway based on user region/preference
   ├─ US/EU → Stripe
   ├─ Russia → Yandex.Kassa (preferred) → Sberbank → WebMoney (fallback)
   └─ Other → Stripe
   ↓
4. Wait for payment confirmation (webhook)
   ↓
5a. If SUCCESS:
    - Mark subscription active
    - Mark payment completed
    - Publish subscription.activated event
    - Grant content access
    
5b. If FAILED:
    - Retry payment (exponential backoff)
    - Send retry notification email
    - After 3 failures → mark subscription failed
```

**Idempotency**:
- All payment requests include idempotency key
- Prevents duplicate charges on network retry
- Gateway maintains idempotency for 24 hours

## Health Integration Services

### Apple HealthKit Integration

**OAuth Flow**:

```
User grants permission
  ↓
Request HealthKit access
  ├─ Steps, Active Energy, Distance, Heart Rate
  ├─ Sleep Analysis, Workouts
  └─ Blood Pressure, Weight (if available)
  ↓
iOS app fetches data
  ↓
Send encrypted to backend via HTTPS
```

**Data Sync**:
- Initial sync: Last 90 days of data
- Incremental sync: Daily, background refresh
- Real-time: Workout completion events
- Storage: PostgreSQL + TimescaleDB for time-series

### Google Fit Integration

**OAuth Flow**:

```
User authenticates with Google Account
  ↓
Request Google Fit scopes:
  - fitness.body.read (weight, measurements)
  - fitness.blood_pressure.read
  - fitness.blood_glucose.read
  - fitness.sleep.read
  - fitness.activity.read
  ↓
Backend fetches data via Google Fit API
  ↓
Store in health_metrics table
```

**API Configuration**:

```typescript
const googleFitConfig = {
  clientId: process.env.GOOGLE_FIT_CLIENT_ID,
  clientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET,
  redirectUri: 'https://api.platform.com/oauth/google-fit/callback',
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
  ],
  dataSourceId: 'derived:com.google.step_count:com.google.android.gms:estimated_steps'
};
```

**Data Normalization**:

```
Raw Google Fit data
  ↓
Convert units/formats to standard
  ↓
Store with source attribution
  ↓
Available for analytics/AI personalization
```

### Garmin Connect Integration

**Configuration**:

```typescript
const garminConfig = {
  clientId: process.env.GARMIN_CLIENT_ID,
  clientSecret: process.env.GARMIN_CLIENT_SECRET,
  redirectUri: 'https://api.platform.com/oauth/garmin/callback',
  scope: 'ACTIVITY:READ, BIOMETRICS:READ'
};
```

**Webhook Handling**:
- Daily activity summary
- Workout events
- Device sync notifications

### Fitbit Integration

**Configuration**:

```typescript
const fitbitConfig = {
  clientId: process.env.FITBIT_CLIENT_ID,
  clientSecret: process.env.FITBIT_CLIENT_SECRET,
  redirectUri: 'https://api.platform.com/oauth/fitbit/callback',
  scopes: ['activity', 'heartrate', 'sleep', 'weight']
};
```

## AI & Microservices Integrations

### Workout Recommendation Microservice

**Service**: FastAPI (Python)

**Interface**:

```
POST /api/recommendations/workouts

Request:
{
  "userId": "uuid",
  "fitnessLevel": "intermediate",
  "targetGoal": "muscle_gain",
  "availableMinutes": 60,
  "preferences": ["strength", "compound_movements"],
  "recentMetrics": {
    "avgHeartRate": 75,
    "sleepHours": 7.5
  }
}

Response:
{
  "recommendations": [
    {
      "workoutPlanId": "uuid",
      "score": 0.92,
      "reason": "Matches strength training goal and available time"
    }
  ]
}
```

**Integration**:
- Deployed on ECS Fargate
- Model update: Weekly (batch job)
- Feature store: Real-time features via Redis
- Response timeout: 2 seconds (SLA)
- Circuit breaker: Fallback to rule-based recommendations

### Content Personalization Engine

**Features**:
- User engagement history
- Completion rate by content type
- Time of day preferences
- Device/platform usage
- Health metrics correlation

**Request Pattern**:

```
GET /api/personalization/content-feed

Query params:
  - userId
  - limit (default: 20)
  - includeMetrics (default: true)

Response includes personalization scores for ranking
```

### Predictive Analytics

**Capabilities**:
- Churn prediction
- Completion likelihood
- Revenue forecasting
- Content performance prediction

**Update Frequency**: Daily batch job (00:00 UTC)

## Error Handling & Resilience

### Retry Strategy

**Exponential Backoff**:

```
Retry 1: After 1 second
Retry 2: After 4 seconds (2^2)
Retry 3: After 9 seconds (3^2)
Retry 4: After 16 seconds (4^2)
Max retries: 4 (total 30 seconds)
```

**Idempotent Operations Only**:
- GET requests: Unlimited retries
- POST/PUT with idempotency key: Safe retries
- POST without idempotency key: No retry (manual review)

### Circuit Breaker Pattern

**States**:

```
CLOSED (normal)
  ├─ If failure rate > 50% for 10 requests → OPEN
  │
OPEN (blocking requests)
  ├─ After 60 seconds → HALF_OPEN
  │
HALF_OPEN (testing recovery)
  ├─ If next request succeeds → CLOSED
  ├─ If next request fails → OPEN (wait 120 seconds)
```

**Configuration Example**:

```typescript
const circuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  healthCheck: async () => healthCheckExternal Service()
};
```

### Timeout Management

**Service Timeouts**:
- OAuth flows: 30 seconds
- Payment gateways: 30 seconds
- Health data sync: 120 seconds
- AI recommendations: 2 seconds
- Email service: 10 seconds

## Logging & Audit Trail

### Integration Events

All integrations log:
- Request timestamp
- Service name
- Request ID (for tracing)
- Response time
- Status code
- Error details (if failed)
- User context (redacted PII)

### Sensitive Data Handling

**PCI-DSS Compliance**:
- Never log full card numbers
- Tokenize payment references
- Encrypt stored tokens

**GDPR Compliance**:
- No personal data in logs (except in secure audit table)
- Log rotation: 90 days
- Right to erasure: Delete user integration records on request

## Rationale

1. **Multiple OAuth providers**: Reduces sign-up friction in target markets
2. **Payment gateway diversification**: Minimizes single point of failure, optimizes for regional preferences
3. **Health platform support**: Provides comprehensive health data without user manual entry
4. **AI microservices**: Enables real-time personalization without core system overhead
5. **Resilience patterns**: Ensures reliability despite external service failures
6. **Audit logging**: Supports compliance and debugging

## Consequences

**Positive**:
- Seamless third-party integrations
- Resilient to external service degradation
- GDPR/PCI-DSS compliant
- Flexible payment options globally

**Negative**:
- Additional operational complexity
- External dependency monitoring required
- Token refresh lifecycle management
- PII handling across multiple systems

## Related ADRs

- [ADR 001: Technology Stack](./001-technology-stack.md)
- [ADR 002: Domain Boundaries](./002-domain-boundaries.md)
- [ADR 006: Security & Compliance](./006-security-compliance.md)
