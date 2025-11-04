# ADR 004: Data Model & Core Entities

**Status**: Accepted

**Date**: 2024

**Context**

The platform requires a well-designed data model supporting complex relationships between users, trainers, content, workouts, subscriptions, payments, and health metrics. The model must support ACID compliance, efficient queries, and regulatory compliance (GDPR, Russian PDPA).

**Decision**

We establish the following core entity models with relationships:

## Core Entities

### 1. User (Aggregate Root)

**Primary Domain**: Authentication & Authorization

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_image_url VARCHAR(500),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    country_code VARCHAR(2),
    preferred_language VARCHAR(10) DEFAULT 'en',
    
    -- Authentication
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_method VARCHAR(20), -- 'sms', 'email', 'authenticator'
    
    -- Profile
    bio TEXT,
    fitness_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    goals JSONB, -- Array of fitness goals
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip INET,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMP, -- Soft delete for GDPR
    
    -- Indexes
    INDEX idx_email,
    INDEX idx_username,
    INDEX idx_country_code,
    INDEX idx_created_at
);
```

### 2. Trainer (Aggregate Root)

**Primary Domain**: Training & Workouts

```sql
CREATE TABLE trainers (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    specializations JSONB NOT NULL, -- ['strength', 'cardio', 'flexibility']
    certification_level VARCHAR(50), -- 'level_1', 'level_2', 'level_3'
    certifications JSONB, -- Array of certification objects
    bio TEXT,
    bio_image_url VARCHAR(500),
    hourly_rate INTEGER, -- In cents
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_is_verified,
    INDEX idx_rating DESC
);
```

### 3. Workout Plan (Aggregate Root)

**Primary Domain**: Training & Workouts

```sql
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES trainers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    duration_weeks INTEGER,
    target_audience VARCHAR(255), -- e.g., 'weight_loss', 'muscle_gain', 'endurance'
    exercises_count INTEGER,
    estimated_duration_minutes INTEGER,
    
    -- Versioning
    version INTEGER DEFAULT 1,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete
    
    INDEX idx_trainer_id,
    INDEX idx_is_published,
    INDEX idx_difficulty_level,
    INDEX idx_created_at
);
```

### 4. Exercise (Value Object)

**Primary Domain**: Training & Workouts

```sql
CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    instructions JSONB, -- Array of instruction steps with images
    category VARCHAR(50), -- 'strength', 'cardio', 'flexibility', 'balance'
    equipment_required JSONB, -- Array of equipment names
    difficulty_level VARCHAR(50),
    muscle_groups JSONB, -- ['biceps', 'chest', 'core']
    video_url VARCHAR(500),
    tutorial_video_id UUID,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category,
    INDEX idx_name
);

CREATE TABLE workout_plan_exercises (
    id UUID PRIMARY KEY,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    sequence_number INTEGER NOT NULL,
    sets INTEGER,
    reps INTEGER,
    duration_seconds INTEGER,
    weight_kg DECIMAL(5, 2),
    rest_seconds INTEGER,
    notes TEXT,
    
    UNIQUE(workout_plan_id, sequence_number),
    INDEX idx_workout_plan_id
);
```

### 5. Habit (Aggregate Root)

**Primary Domain**: Training & Workouts

```sql
CREATE TABLE habits (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- 'workout', 'nutrition', 'sleep', 'meditation'
    target_value INTEGER, -- e.g., 30 (minutes)
    unit VARCHAR(50), -- 'minutes', 'hours', 'servings', 'cups'
    frequency_per_week INTEGER,
    color_hex VARCHAR(7),
    icon_id VARCHAR(50),
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_is_active
);

CREATE TABLE habit_logs (
    id UUID PRIMARY KEY,
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    logged_date DATE NOT NULL,
    value INTEGER,
    notes TEXT,
    completed BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(habit_id, logged_date),
    INDEX idx_habit_id,
    INDEX idx_logged_date
);
```

### 6. Content Item (Aggregate Root)

**Primary Domain**: Content Management

```sql
CREATE TABLE content_items (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES trainers(id),
    type VARCHAR(50), -- 'video', 'article', 'quiz', 'interactive'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    content_url VARCHAR(500), -- S3 URL
    duration_seconds INTEGER, -- For videos
    
    -- Metadata
    tags JSONB, -- Array of tags
    categories JSONB, -- Array of categories
    difficulty_level VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    
    -- Status
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    INDEX idx_creator_id,
    INDEX idx_type,
    INDEX idx_is_published,
    INDEX idx_categories,
    FULLTEXT idx_title_description (title, description)
);
```

### 7. Course (Aggregate Root)

**Primary Domain**: Content Management

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES trainers(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(500),
    
    -- Course structure
    duration_hours INTEGER,
    level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    lessons_count INTEGER,
    
    -- Pricing & access
    is_free BOOLEAN DEFAULT FALSE,
    price_cents INTEGER,
    
    -- Publishing
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- Metrics
    enrollments_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.0,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_creator_id,
    INDEX idx_is_published
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_item_ids JSONB, -- Array of content_item UUIDs
    duration_minutes INTEGER,
    
    UNIQUE(course_id, sequence_number),
    INDEX idx_course_id
);
```

### 8. Subscription (Aggregate Root)

**Primary Domain**: Subscription & Payments

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_cents INTEGER,
    billing_period VARCHAR(50), -- 'monthly', 'quarterly', 'annual'
    trial_period_days INTEGER,
    features JSONB, -- Array of feature strings
    max_courses INTEGER,
    max_trainers INTEGER,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    
    status VARCHAR(50), -- 'active', 'canceled', 'paused', 'expired'
    start_date DATE NOT NULL,
    end_date DATE,
    renewal_date DATE,
    
    auto_renewal BOOLEAN DEFAULT TRUE,
    
    -- Trial
    trial_end_date DATE,
    is_trial BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    canceled_at TIMESTAMP,
    canceled_reason TEXT,
    
    INDEX idx_user_id,
    INDEX idx_status,
    INDEX idx_renewal_date
);
```

### 9. Payment (Aggregate Root)

**Primary Domain**: Subscription & Payments

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD', -- ISO 4217
    
    status VARCHAR(50), -- 'pending', 'completed', 'failed', 'refunded'
    payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'wallet'
    payment_gateway VARCHAR(50), -- 'stripe', 'yandex_kassa', 'sberbank'
    
    -- Payment details (PCI-DSS compliance)
    payment_intent_id VARCHAR(255),
    card_last_4 VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Metadata
    description VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE,
    
    -- Timeline
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Compliance
    payer_name VARCHAR(255),
    payer_email VARCHAR(255),
    payer_country VARCHAR(2),
    
    INDEX idx_subscription_id,
    INDEX idx_status,
    INDEX idx_payment_gateway,
    INDEX idx_created_at
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES payments(id),
    amount_cents INTEGER NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50), -- 'pending', 'completed', 'failed'
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

### 10. Health Metric (Aggregate Root)

**Primary Domain**: Health Metrics & Tracking

```sql
-- Time-series table (consider TimescaleDB hypertable in production)
CREATE TABLE health_metrics (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    metric_type VARCHAR(50) NOT NULL, -- 'steps', 'heart_rate', 'calories', 'sleep_duration'
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50), -- 'steps', 'bpm', 'kcal', 'minutes'
    
    -- Source
    source VARCHAR(50), -- 'apple_health', 'google_fit', 'manual', 'wearable'
    source_device VARCHAR(255), -- Device name or API integration
    
    recorded_date TIMESTAMP NOT NULL,
    synced_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id,
    INDEX idx_metric_type,
    INDEX idx_recorded_date,
    INDEX idx_source
);

CREATE TABLE health_goals (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    metric_type VARCHAR(50) NOT NULL,
    target_value INTEGER NOT NULL,
    unit VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_integrations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    provider VARCHAR(50) NOT NULL, -- 'apple_health', 'google_fit'
    access_token_encrypted VARCHAR(500),
    refresh_token_encrypted VARCHAR(500),
    token_expires_at TIMESTAMP,
    
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, provider)
);
```

## Relationships Summary

```
User
  ├─ 1:1 ─→ Trainer (some users are trainers)
  ├─ 1:N ─→ WorkoutPlan (enrolled in plans)
  ├─ 1:N ─→ Habit (creates habits)
  ├─ 1:N ─→ ContentItem (accesses content)
  ├─ 1:N ─→ Subscription (has subscription)
  ├─ 1:N ─→ HealthMetric (tracks metrics)
  └─ 1:N ─→ HealthIntegration (links health apps)

Trainer
  ├─ 1:N ─→ WorkoutPlan (creates plans)
  ├─ 1:N ─→ ContentItem (creates content)
  └─ 1:N ─→ Course (creates courses)

WorkoutPlan
  ├─ N:M ─→ Exercise (contains exercises)
  └─ 1:N ─→ WorkoutSession (user executions)

Course
  ├─ 1:N ─→ Lesson (contains lessons)
  └─ 1:N ─→ ContentItem (includes content items)

Subscription
  ├─ 1:1 ─→ SubscriptionPlan
  └─ 1:N ─→ Payment (payment history)
```

## Data Integrity Constraints

1. **Soft Deletes**: Users and WorkoutPlans use `deleted_at` for GDPR compliance
2. **Immutable History**: Workout executions and payment records are immutable
3. **Uniqueness**: Email, username, exercise names are globally unique
4. **Referential Integrity**: Foreign keys with cascade delete where appropriate
5. **Audit Trail**: All payments and sensitive operations logged

## Encryption & Compliance

**Encrypted Fields** (at-rest and in-transit):
- Health integration tokens (AES-256)
- Payment card details (tokenized, not stored directly)
- User phone numbers (GDPR sensitive)

**Data Retention**:
- User data: Until account deletion
- Payment records: 7 years (regulatory requirement)
- Health metrics: User-configurable (default 2 years)
- Audit logs: 2 years minimum

## Indexing Strategy

**Performance Indexes**:
- Composite indexes for common queries (user_id + created_at)
- Partial indexes for active records (WHERE is_active = TRUE)
- Full-text search indexes on content (title, description)
- Range indexes on dates for time-series queries

## Rationale

1. **Aggregate Design**: Each aggregate root (User, WorkoutPlan, etc.) can be managed independently
2. **Normalization**: Reduced data redundancy while maintaining query efficiency
3. **Audit Trail**: Soft deletes and timestamps support GDPR data subject requests
4. **Scalability**: Proper indexing enables efficient queries at scale
5. **Compliance**: Encryption and retention policies built into schema

## Consequences

**Positive**:
- Clear data ownership and relationships
- Easy to query and reason about data
- Supports audit and compliance requirements
- Extensible for future features

**Negative**:
- Join complexity for complex queries
- Soft deletes require filtering in queries
- Need careful migration strategies for schema changes

## Related ADRs

- [ADR 002: Domain Boundaries](./002-domain-boundaries.md)
- [ADR 006: Security & Compliance](./006-security-compliance.md)
