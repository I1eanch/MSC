# Entity Relationship Diagram (ERD)

## Core Entities & Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION DOMAIN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────────────────────────────────────────────────┐    │
│    │                    users                                │    │
│    ├─────────────────────────────────────────────────────────┤    │
│    │ id: UUID (PK)                                           │    │
│    │ email: VARCHAR UNIQUE                                  │    │
│    │ username: VARCHAR UNIQUE                               │    │
│    │ password_hash: VARCHAR                                 │    │
│    │ first_name: VARCHAR                                    │    │
│    │ last_name: VARCHAR                                     │    │
│    │ date_of_birth: DATE                                    │    │
│    │ gender: VARCHAR                                        │    │
│    │ email_verified: BOOLEAN                                │    │
│    │ two_factor_enabled: BOOLEAN                            │    │
│    │ is_active: BOOLEAN                                     │    │
│    │ created_at: TIMESTAMP                                  │    │
│    │ updated_at: TIMESTAMP                                  │    │
│    │ deleted_at: TIMESTAMP (soft delete, GDPR)             │    │
│    └─────────────────────────────────────────────────────────┘    │
│                      │                                              │
│                      │ 1:N                                          │
│                      └─────┐                                        │
│    ┌──────────────────────▼────────────────────────────────┐      │
│    │              user_oauth_connections                   │      │
│    ├───────────────────────────────────────────────────────┤      │
│    │ id: UUID (PK)                                         │      │
│    │ user_id: UUID (FK) ◄─────────┘                       │      │
│    │ provider: VARCHAR (google, apple, yandex, vk)       │      │
│    │ provider_user_id: VARCHAR                            │      │
│    │ email_from_provider: VARCHAR                         │      │
│    │ access_token_encrypted: VARCHAR                      │      │
│    │ refresh_token_encrypted: VARCHAR                     │      │
│    │ token_expires_at: TIMESTAMP                          │      │
│    │ created_at: TIMESTAMP                                │      │
│    │ updated_at: TIMESTAMP                                │      │
│    │ UNIQUE(user_id, provider)                            │      │
│    └───────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      TRAINING & WORKOUTS DOMAIN                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐                                          │
│  │     trainers         │                                          │
│  ├──────────────────────┤                                          │
│  │ id: UUID (PK)        │                                          │
│  │ user_id: UUID (FK)   │───────┐                                 │
│  │ specializations:     │       │                                 │
│  │  JSONB               │       │ Extends user                    │
│  │ certification_level  │       │ (1:1 optional)                 │
│  │ rating: DECIMAL      │       │                                 │
│  │ verified: BOOLEAN    │       │                                 │
│  │ created_at           │       │                                 │
│  └──────────────────────┘       │                                 │
│        │                        │                                 │
│        │ 1:N                    │                                 │
│        │ (creates)              │                                 │
│        │                        │                                 │
│        ▼                        │                                 │
│  ┌──────────────────────────────────────────────┐                │
│  │         workout_plans                        │                │
│  ├──────────────────────────────────────────────┤                │
│  │ id: UUID (PK)                                │                │
│  │ trainer_id: UUID (FK) ◄─────────────┘       │                │
│  │ name: VARCHAR                                │                │
│  │ description: TEXT                            │                │
│  │ difficulty_level: VARCHAR                    │                │
│  │ duration_weeks: INTEGER                      │                │
│  │ target_audience: VARCHAR                     │                │
│  │ version: INTEGER                             │                │
│  │ is_published: BOOLEAN                        │                │
│  │ created_at: TIMESTAMP                        │                │
│  │ deleted_at: TIMESTAMP (soft delete)          │                │
│  └──────────────┬───────────────────────────────┘                │
│                 │                                                │
│                 │ N:M                                            │
│                 │ (contains)                                     │
│                 │                                                │
│        ┌────────┴──────────┐                                     │
│        │                   │                                     │
│        ▼                   ▼                                      │
│  ┌──────────────────┐  ┌──────────────────────────┐             │
│  │    exercises     │  │ workout_plan_exercises   │             │
│  ├──────────────────┤  ├──────────────────────────┤             │
│  │ id: UUID (PK)    │  │ id: UUID (PK)            │             │
│  │ name: VARCHAR    │  │ workout_plan_id: UUID    │             │
│  │ category: VARCHAR│  │  (FK) ◄─────────────┐    │             │
│  │ equipment:       │  │ exercise_id: UUID (FK)   │             │
│  │  JSONB           │  │  ◄────────────┐          │             │
│  │ difficulty:      │  │ sequence_num: INT        │             │
│  │  VARCHAR         │  │ sets: INT                │             │
│  │ muscle_groups:   │  │ reps: INT                │             │
│  │  JSONB           │  │ weight_kg: DECIMAL       │             │
│  │ video_url:       │  │ rest_seconds: INT        │             │
│  │  VARCHAR         │  │                          │             │
│  │ created_at       │  │ UNIQUE(plan_id, seq#)    │             │
│  └──────────────────┘  └──────────────────────────┘             │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │      workout_sessions                        │               │
│  ├──────────────────────────────────────────────┤               │
│  │ id: UUID (PK)                                │               │
│  │ user_id: UUID (FK) ──────┐                  │               │
│  │ workout_plan_id: UUID    │                  │               │
│  │  (FK) ◄──────┐           │                  │               │
│  │ started_at: TIMESTAMP    │                  │               │
│  │ completed_at: TIMESTAMP  │                  │               │
│  │ status: VARCHAR          │                  │               │
│  │ duration_seconds: INT    │                  │               │
│  │ intensity_level:         │                  │               │
│  │  VARCHAR                 │                  │               │
│  │ notes: TEXT              │                  │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │        habits                                │               │
│  ├──────────────────────────────────────────────┤               │
│  │ id: UUID (PK)                                │               │
│  │ user_id: UUID (FK) ◄──────────────────┐     │               │
│  │ name: VARCHAR                          │     │               │
│  │ category: VARCHAR                      │     │               │
│  │ target_value: INT                      │     │               │
│  │ unit: VARCHAR                          │     │               │
│  │ frequency_per_week: INT                │     │               │
│  │ is_active: BOOLEAN                     │     │               │
│  │ created_at: TIMESTAMP                  │     │               │
│  └──────────────────────────────────────────────┘               │
│           │                                                     │
│           │ 1:N                                                 │
│           │ (logs)                                              │
│           │                                                     │
│           ▼                                                      │
│  ┌──────────────────────────────────────────────┐               │
│  │       habit_logs                             │               │
│  ├──────────────────────────────────────────────┤               │
│  │ id: UUID (PK)                                │               │
│  │ habit_id: UUID (FK) ◄──────────┘            │               │
│  │ logged_date: DATE                            │               │
│  │ value: INT                                   │               │
│  │ completed: BOOLEAN                           │               │
│  │ notes: TEXT                                  │               │
│  │ created_at: TIMESTAMP                        │               │
│  │ UNIQUE(habit_id, logged_date)                │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                   CONTENT MANAGEMENT DOMAIN                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │      content_items                           │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ creator_id: UUID (FK) ──────┐               │                 │
│  │ type: VARCHAR                │               │                 │
│  │ title: VARCHAR               │               │                 │
│  │ description: TEXT            │               │                 │
│  │ content_url: VARCHAR         │               │                 │
│  │ thumbnail_url: VARCHAR       │               │                 │
│  │ tags: JSONB                  │               │                 │
│  │ difficulty_level: VARCHAR    │               │                 │
│  │ is_published: BOOLEAN        │               │                 │
│  │ view_count: INT              │               │                 │
│  │ rating: DECIMAL              │               │                 │
│  │ created_at: TIMESTAMP        │               │                 │
│  │ FULLTEXT(title, description) │               │                 │
│  └──────────────────────────────────────────────┘                 │
│           │                                │                      │
│           │ References                    │ Created by            │
│           │ Trainers                      │ (trainer_id)          │
│           │                               │                      │
│           ▼                               │                      │
│  ┌──────────────────────────────────────────────┐                 │
│  │         courses                              │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ creator_id: UUID (FK) ◄────────────────┘    │                 │
│  │ name: VARCHAR                                │                 │
│  │ description: TEXT                            │                 │
│  │ cover_image_url: VARCHAR                     │                 │
│  │ duration_hours: INT                          │                 │
│  │ level: VARCHAR                               │                 │
│  │ is_free: BOOLEAN                             │                 │
│  │ price_cents: INT                             │                 │
│  │ is_published: BOOLEAN                        │                 │
│  │ enrollments_count: INT                       │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  └──────────────────────────────────────────────┘                 │
│           │                                                        │
│           │ 1:N                                                    │
│           │ (contains)                                             │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────────────────────────────────┐                 │
│  │        lessons                               │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ course_id: UUID (FK) ◄──────────────┘       │                 │
│  │ sequence_number: INT                         │                 │
│  │ title: VARCHAR                               │                 │
│  │ description: TEXT                            │                 │
│  │ content_item_ids: JSONB                      │                 │
│  │ duration_minutes: INT                        │                 │
│  │ UNIQUE(course_id, sequence_number)           │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                 SUBSCRIPTION & PAYMENTS DOMAIN                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │    subscription_plans                        │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ name: VARCHAR                                │                 │
│  │ description: TEXT                            │                 │
│  │ price_cents: INT                             │                 │
│  │ billing_period: VARCHAR                      │                 │
│  │  (monthly, quarterly, annual)                │                 │
│  │ trial_period_days: INT                       │                 │
│  │ features: JSONB                              │                 │
│  │ max_courses: INT                             │                 │
│  │ max_trainers: INT                            │                 │
│  │ is_active: BOOLEAN                           │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  └──────────────────────────────────────────────┘                 │
│           │                                                        │
│           │ 1:N                                                    │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────────────────────────────────┐                 │
│  │       subscriptions                          │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ user_id: UUID (FK) ──────────┐              │                 │
│  │ plan_id: UUID (FK) ◄──────┐  │              │                 │
│  │ status: VARCHAR            │  │              │                 │
│  │  (active, canceled, expired)│  │             │                 │
│  │ start_date: DATE           │  │              │                 │
│  │ end_date: DATE             │  │              │                 │
│  │ renewal_date: DATE         │  │              │                 │
│  │ auto_renewal: BOOLEAN      │  │              │                 │
│  │ is_trial: BOOLEAN          │  │              │                 │
│  │ trial_end_date: DATE       │  │              │                 │
│  │ created_at: TIMESTAMP      │  │              │                 │
│  │ canceled_at: TIMESTAMP     │  │              │                 │
│  └──────────────────────────────────────────────┘                 │
│           │                                │                      │
│           │ 1:N                            │                      │
│           │ (payment history)              └─ References          │
│           │                                   plan_id              │
│           ▼                                                        │
│  ┌──────────────────────────────────────────────┐                 │
│  │         payments                             │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ subscription_id: UUID (FK) ◄────────┘       │                 │
│  │ amount_cents: INT                            │                 │
│  │ currency: VARCHAR (ISO 4217)                 │                 │
│  │ status: VARCHAR                              │                 │
│  │  (pending, completed, failed, refunded)      │                 │
│  │ payment_method: VARCHAR                      │                 │
│  │ payment_gateway: VARCHAR                     │                 │
│  │  (stripe, yandex_kassa, sberbank, webmoney) │                 │
│  │ payment_intent_id: VARCHAR                   │                 │
│  │ card_last_4: VARCHAR                         │                 │
│  │ idempotency_key: VARCHAR (UNIQUE)            │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  │ processed_at: TIMESTAMP                      │                 │
│  │ payer_name: VARCHAR                          │                 │
│  │ payer_country: VARCHAR                       │                 │
│  └──────────────────────────────────────────────┘                 │
│           │                                                        │
│           │ 1:N                                                    │
│           │ (refunds)                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌──────────────────────────────────────────────┐                 │
│  │        refunds                               │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ payment_id: UUID (FK) ◄──────────────┘      │                 │
│  │ amount_cents: INT                            │                 │
│  │ reason: VARCHAR                              │                 │
│  │ status: VARCHAR                              │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  │ processed_at: TIMESTAMP                      │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│              HEALTH METRICS & TRACKING DOMAIN                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │    health_metrics (Time-series)              │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ user_id: UUID (FK) ────────────┐            │                 │
│  │ metric_type: VARCHAR            │            │                 │
│  │  (steps, heart_rate, calories)  │            │                 │
│  │ value: DECIMAL                  │            │                 │
│  │ unit: VARCHAR                   │            │                 │
│  │ source: VARCHAR                 │            │                 │
│  │ source_device: VARCHAR          │            │                 │
│  │ recorded_date: TIMESTAMP        │            │                 │
│  │ synced_at: TIMESTAMP            │            │                 │
│  │ created_at: TIMESTAMP           │            │                 │
│  │ INDEX(user_id, metric_type,     │            │                 │
│  │       recorded_date)             │            │                 │
│  └──────────────────────────────────────────────┘                 │
│                                │                                   │
│                                │ 1:N                               │
│                                │                                   │
│        ┌───────────────────────┘                                  │
│        │                                                           │
│        ├──► ┌──────────────────────────────────────────────┐      │
│        │    │    health_goals                             │      │
│        │    ├──────────────────────────────────────────────┤      │
│        │    │ id: UUID (PK)                               │      │
│        │    │ user_id: UUID (FK) ◄─────┐                │      │
│        │    │ metric_type: VARCHAR      │                │      │
│        │    │ target_value: INT         │                │      │
│        │    │ unit: VARCHAR             │                │      │
│        │    │ start_date: DATE          │                │      │
│        │    │ end_date: DATE            │                │      │
│        │    │ is_active: BOOLEAN        │                │      │
│        │    │ created_at: TIMESTAMP     │                │      │
│        │    └──────────────────────────────────────────────┘      │
│        │                                                           │
│        └──► ┌──────────────────────────────────────────────┐      │
│             │ health_integrations                         │      │
│             ├──────────────────────────────────────────────┤      │
│             │ id: UUID (PK)                               │      │
│             │ user_id: UUID (FK) ◄────┐                 │      │
│             │ provider: VARCHAR        │                 │      │
│             │  (apple_health,          │                 │      │
│             │   google_fit,            │                 │      │
│             │   garmin, fitbit)        │                 │      │
│             │ access_token_encrypted   │                 │      │
│             │ refresh_token_encrypted  │                 │      │
│             │ token_expires_at: TS     │                 │      │
│             │ is_active: BOOLEAN       │                 │      │
│             │ last_sync_at: TIMESTAMP  │                 │      │
│             │ created_at: TIMESTAMP    │                 │      │
│             │ UNIQUE(user_id, provider)│                 │      │
│             └──────────────────────────────────────────────┘      │
│                                │                                   │
│                                └─ 1:N                             │
│                                   |                               │
└────────────────────────────────────┼───────────────────────────────┘
                                     │
                                     ▼ Connected to users


┌─────────────────────────────────────────────────────────────────────┐
│                    ANALYTICS & REPORTING DOMAIN                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │    analytics_events                          │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ user_id: UUID (FK)                           │                 │
│  │ event_type: VARCHAR                          │                 │
│  │  (signup, login, workout_complete, etc.)     │                 │
│  │ event_data: JSONB                            │                 │
│  │ source: VARCHAR (web, ios, android)          │                 │
│  │ device_info: JSONB                           │                 │
│  │ ip_address: INET (anonymized)                │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  │ INDEX(user_id, created_at, event_type)       │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
│  ┌──────────────────────────────────────────────┐                 │
│  │    cohorts                                   │                 │
│  ├──────────────────────────────────────────────┤                 │
│  │ id: UUID (PK)                                │                 │
│  │ name: VARCHAR                                │                 │
│  │ definition_json: JSONB                       │                 │
│  │ (query/rules for cohort membership)          │                 │
│  │ user_count: INT                              │                 │
│  │ created_at: TIMESTAMP                        │                 │
│  │ updated_at: TIMESTAMP                        │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
└──────────────────────────────────────────────────────────────────────┘
```

## Aggregate Root Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│  AGGREGATE ROOTS (Data consistency boundaries)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Aggregate Root:                                            │
│  ├─ users (entity)                                              │
│  ├─ user_oauth_connections (value objects)                     │
│  └─ Relations: 1:N with habits, subscriptions, etc.            │
│                                                                  │
│  Trainer Aggregate Root:                                         │
│  ├─ trainers (entity)                                           │
│  └─ Relations: 1:N with workout_plans, content_items           │
│                                                                  │
│  WorkoutPlan Aggregate Root:                                     │
│  ├─ workout_plans (entity)                                      │
│  ├─ workout_plan_exercises (collection)                         │
│  ├─ exercises (value objects, shared)                          │
│  └─ Relations: N:1 with trainers, 1:N with sessions            │
│                                                                  │
│  ContentItem Aggregate Root:                                     │
│  ├─ content_items (entity)                                      │
│  └─ Relations: N:1 with trainers                                │
│                                                                  │
│  Course Aggregate Root:                                          │
│  ├─ courses (entity)                                            │
│  ├─ lessons (collection)                                        │
│  └─ Relations: N:1 with trainers                                │
│                                                                  │
│  Subscription Aggregate Root:                                    │
│  ├─ subscriptions (entity)                                      │
│  ├─ payments (collection)                                       │
│  ├─ refunds (nested in payments)                               │
│  └─ Relations: N:1 with users and plans                        │
│                                                                  │
│  HealthMetric Aggregate Root:                                    │
│  ├─ health_metrics (entity)                                     │
│  ├─ health_goals (collection)                                   │
│  ├─ health_integrations (collection)                            │
│  └─ Relations: N:1 with users                                   │
│                                                                  │
│  AnalyticsEvent Aggregate Root:                                  │
│  ├─ analytics_events (entity)                                   │
│  └─ Relations: N:1 with users                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Constraints & Rules

```
┌──────────────────────────────────────────────────────────────────┐
│  DATA INTEGRITY & BUSINESS RULES                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Foreign Key Constraints:                                        │
│  • subscription → subscription_plan (required)                  │
│  • subscription → user (required)                               │
│  • payment → subscription (required)                            │
│  • refund → payment (required)                                  │
│  • workout_plan → trainer (required)                            │
│  • workout_session → user, workout_plan (required)             │
│  • health_metric → user (required)                              │
│  • content_item → trainer (required)                            │
│                                                                  │
│  Cascade Delete:                                                 │
│  • subscription → payment (delete)                              │
│  • payment → refund (delete)                                    │
│  • workout_plan → workout_plan_exercises (delete)              │
│  • course → lessons (delete)                                    │
│                                                                  │
│  Unique Constraints:                                             │
│  • users.email (global unique)                                  │
│  • users.username (global unique)                               │
│  • exercises.name (global unique)                               │
│  • user_oauth_connections (user_id, provider)                  │
│  • workout_plan_exercises (plan_id, sequence_number)           │
│  • habit_logs (habit_id, logged_date)                          │
│  • health_integrations (user_id, provider)                     │
│  • payments.idempotency_key (prevent duplicate payments)       │
│                                                                  │
│  Business Rules:                                                 │
│  • Only trainers can create workout plans                       │
│  • Subscription status transitions immutable after payment      │
│  • Health metrics immutable after recording                     │
│  • Deleted users marked with deleted_at (soft delete)          │
│  • Payment amounts must be > 0                                  │
│  • Trial period must be within 0-90 days                        │
│  • Workout plan version auto-increments on publish              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Indexing Strategy for Performance

```
┌──────────────────────────────────────────────────────────────────┐
│  KEY INDEXES FOR QUERY PERFORMANCE                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  users:                                                          │
│  • PRIMARY: id (UUID)                                           │
│  • UNIQUE: email, username                                      │
│  • INDEX: country_code, created_at                              │
│                                                                  │
│  subscriptions:                                                  │
│  • PRIMARY: id                                                   │
│  • INDEX: (user_id, status)                                     │
│  • INDEX: renewal_date (for upcoming renewals)                  │
│  • INDEX: created_at DESC (recent subscriptions)                │
│                                                                  │
│  payments:                                                       │
│  • PRIMARY: id                                                   │
│  • INDEX: subscription_id, status                               │
│  • INDEX: payment_gateway                                       │
│  • INDEX: created_at DESC                                       │
│                                                                  │
│  health_metrics (Time-series optimization):                     │
│  • PRIMARY: id                                                   │
│  • COMPOSITE: (user_id, metric_type, recorded_date DESC)       │
│  • INDEX: source, synced_at                                     │
│  • PARTITION: By recorded_date (monthly)                        │
│                                                                  │
│  content_items:                                                  │
│  • PRIMARY: id                                                   │
│  • INDEX: creator_id, is_published                              │
│  • FULLTEXT: (title, description)                               │
│  • INDEX: categories (GIN for JSONB)                            │
│                                                                  │
│  workout_plans:                                                  │
│  • PRIMARY: id                                                   │
│  • INDEX: trainer_id, is_published                              │
│  • INDEX: difficulty_level, created_at                          │
│                                                                  │
│  habits:                                                         │
│  • PRIMARY: id                                                   │
│  • INDEX: (user_id, is_active)                                  │
│                                                                  │
│  analytics_events (High cardinality, append-only):             │
│  • PRIMARY: id                                                   │
│  • COMPOSITE: (user_id, event_type, created_at)                │
│  • INDEX: event_type                                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Types & Column Specifications

```
┌──────────────────────────────────────────────────────────────────┐
│  COLUMN DATA TYPES (PostgreSQL)                                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  UUID (Primary Keys):                                            │
│  • TYPE: UUID                                                    │
│  • DEFAULT: gen_random_uuid()                                   │
│  • Benefit: Globally unique, can generate client-side           │
│                                                                  │
│  Timestamps:                                                     │
│  • TYPE: TIMESTAMP WITH TIME ZONE                               │
│  • DEFAULT: CURRENT_TIMESTAMP                                   │
│  • Always use UTC for storage                                   │
│                                                                  │
│  Money/Prices:                                                   │
│  • TYPE: INTEGER (in cents)                                     │
│  • Example: 999 = $9.99                                         │
│  • Benefit: Avoids floating-point precision issues              │
│                                                                  │
│  Decimal Values:                                                 │
│  • TYPE: DECIMAL(precision, scale)                              │
│  • Example: DECIMAL(10, 2) for measurements with 2 decimals    │
│                                                                  │
│  Large Text:                                                     │
│  • TYPE: TEXT (unlimited)                                       │
│  • No need for VARCHAR with max length (PostgreSQL 10+)        │
│                                                                  │
│  JSON/JSONB:                                                     │
│  • TYPE: JSONB (binary JSON, indexed)                           │
│  • Use: Flexible attributes (tags, features, goals)            │
│  • Benefit: Can query inside JSON, better performance           │
│                                                                  │
│  IP Addresses:                                                   │
│  • TYPE: INET                                                    │
│  • Supports: IPv4 and IPv6                                      │
│  • Use: For logging, geo-location                               │
│                                                                  │
│  Enums (Status fields):                                          │
│  • Consider VARCHAR over PostgreSQL ENUM                        │
│  • Reason: Easier to add values in microservices               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Versioning & Schema Evolution

```
The schema supports gradual evolution through:

1. Nullable new columns (backward compatible)
2. Soft deletes (no data removal)
3. JSONB for flexible attributes
4. Migration scripts in version control
5. Staging environment testing before production
```
