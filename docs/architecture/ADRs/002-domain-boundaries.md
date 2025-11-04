# ADR 002: Domain-Driven Design Boundaries

**Status**: Accepted

**Date**: 2024

**Context**

The fitness training platform comprises multiple business domains with distinct responsibilities, data models, and service boundaries. A clear domain architecture enables team scalability, independent deployment, and reduced coupling between services.

**Decision**

We establish the following bounded contexts and domain boundaries using Domain-Driven Design (DDD) principles:

### 1. Authentication & Authorization Domain

**Responsibility**: User identity verification, access control, and session management

**Services**:
- User authentication (OAuth, email/password, multi-factor)
- Role-based access control (RBAC)
- Session and token management
- Permission enforcement

**Key Entities**:
- User (aggregate root)
- Role, Permission
- OAuth Provider
- Session, Token

**Database**: PostgreSQL (user credentials encrypted with bcrypt/Argon2)

**External Integrations**: Google, Apple, Yandex, VK OAuth endpoints

---

### 2. Training & Workouts Domain

**Responsibility**: Workout plan creation, management, and execution tracking

**Services**:
- Workout plan CRUD (by trainers)
- Exercise library management
- Workout session execution tracking
- Progress monitoring

**Key Entities**:
- Trainer (aggregate root)
- WorkoutPlan (aggregate root)
- Exercise
- WorkoutSession
- WorkoutExecution

**Database**: PostgreSQL

**Business Rules**:
- Only certified trainers can create plans
- Workout plans version-controlled
- Immutable workout history

---

### 3. Content Management Domain

**Responsibility**: Educational content delivery and management

**Services**:
- Course creation and management
- Video/media hosting
- Learning path definition
- Content versioning

**Key Entities**:
- ContentCreator/Trainer (aggregate root)
- Course (aggregate root)
- Lesson
- Module
- ContentItem (video, article, quiz)
- Media metadata

**Database**: PostgreSQL for metadata, S3 for media files

**External Integrations**: Video encoding services, subtitle generation

---

### 4. Subscription & Payments Domain

**Responsibility**: Billing, subscription management, and payment processing

**Services**:
- Subscription plan management
- Payment processing
- Invoice generation
- Refund handling
- Usage-based billing

**Key Entities**:
- Subscription (aggregate root)
- SubscriptionPlan
- Payment (aggregate root)
- Invoice
- PaymentMethod

**Database**: PostgreSQL (with audit trails for compliance)

**External Integrations**: 
- Stripe for international payments
- Yandex.Kassa for Russian payments
- Sberbank acquiring
- WebMoney

**Compliance**: PCI-DSS Level 1, GDPR article 6 lawful basis

---

### 5. Health Metrics & Tracking Domain

**Responsibility**: User health data collection, aggregation, and analysis

**Services**:
- Health metric ingestion (Apple Health, Google Fit)
- Metric aggregation and normalization
- Health analytics
- Goal tracking

**Key Entities**:
- HealthMetric (aggregate root)
- HealthGoal
- HealthData
- HealthIntegration

**Database**: PostgreSQL + Time-series database (InfluxDB or TimescaleDB extension)

**External Integrations**: 
- Apple HealthKit API
- Google Fit API
- Garmin Connect API
- Fitbit API

---

### 6. AI Services & Personalization Domain

**Responsibility**: ML-driven recommendations and personalization

**Services**:
- Workout recommendation engine
- Content personalization
- Progress prediction
- Adaptive difficulty adjustment
- Anomaly detection

**Key Entities**:
- UserProfile (aggregate root)
- Recommendation
- ML Model metadata

**Database**: PostgreSQL for metadata, separate ML feature store

**ML Services**:
- AWS SageMaker for model training
- FastAPI microservices for inference
- Feature store for real-time feature generation

---

### 7. Analytics & Reporting Domain

**Responsibility**: System-wide analytics and business intelligence

**Services**:
- Event tracking and aggregation
- User behavior analysis
- Revenue analytics
- Content performance metrics
- Cohort analysis

**Key Entities**:
- AnalyticsEvent (aggregate root)
- UserCohort
- Report

**Database**: Data warehouse (Redshift or BigQuery), event stream (Kinesis/Kafka)

**External Integrations**: Google Analytics, custom BI dashboards (Tableau/Looker)

---

### Inter-Domain Communication Patterns

#### Synchronous (REST/gRPC):
- Direct service-to-service calls for immediate responses
- API Gateway for routing
- Circuit breakers for fault tolerance
- Rate limiting per consumer

#### Asynchronous (Event-driven):
- Domain events published to AWS SQS/SNS
- Event sourcing for audit trails
- Saga pattern for distributed transactions (payment + subscription orchestration)

**Example Event Flow**:
```
Payment Domain → payment.completed event
    ↓
Subscription Domain → subscribe user
    ↓
Analytics Domain → record conversion
    ↓
AI Domain → update user profile
    ↓
Content Domain → unlock content tier
```

---

### Ownership Model

Each domain has a designated team with autonomy over:
- Schema design
- Deployment schedule (within integration contracts)
- Technology choices (within approved stack)
- Data retention policies

---

## Rationale

1. **Clear Separation of Concerns**: Each domain has a specific business purpose, enabling focused development.

2. **Scalability**: Domains can be scaled independently based on load patterns.

3. **Team Autonomy**: Cross-functional teams own complete domain lifecycle.

4. **Independent Deployment**: Services can be released on different schedules.

5. **Reduced Complexity**: Smaller bounded contexts are easier to reason about and test.

## Consequences

**Positive**:
- Independent team development and deployment
- Reduced service coupling
- Easier testing and debugging
- Natural scaling points

**Negative**:
- Increased operational complexity
- Data consistency challenges (eventual consistency)
- Distributed transaction management required
- Network latency across service calls

## Related ADRs

- [ADR 001: Technology Stack](./001-technology-stack.md)
- [ADR 003: Deployment Topology](./003-deployment-topology.md)
- [ADR 005: Integration Patterns](./005-integration-patterns.md)
