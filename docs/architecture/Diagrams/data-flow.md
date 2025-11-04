# Data Flow Diagrams

## 1. User Registration & Authentication Flow

```
┌──────────────┐
│  New User    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Select Auth Provider:    │
│ - OAuth (Google/Apple)   │
│ - Email/Password         │
└──────┬───────────────────┘
       │
       ├─── OAuth Path ───┐
       │                  │
       ▼                  ▼
┌────────────────┐   ┌──────────────────┐
│ OAuth Provider │   │ Email Signup     │
│ (Google/Apple) │   │ Form             │
└────────┬───────┘   └────────┬─────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ Auth Service       │
         ├────────────────────┤
         │ 1. Create User     │
         │ 2. Hash Password   │
         │ 3. Set Defaults    │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ PostgreSQL         │
         │ users table        │
         └────────┬───────────┘
                  │
         ┌────────▼──────────┐
         │ Email Service     │
         │ (Verification)    │
         └────────┬──────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ User confirms      │
         │ email link         │
         └────────┬───────────┘
                  │
         ┌────────▼──────────────────┐
         │ Auth Service              │
         │ 1. Verify email           │
         │ 2. Generate JWT tokens    │
         │ 3. Store in Redis cache   │
         └────────┬──────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ Return to Client:  │
         │ - Access Token     │
         │ - Refresh Token    │
         │ - User Data        │
         └────────────────────┘
```

## 2. Workout Plan Subscription Flow

```
┌──────────────┐
│ User Browse  │
│ Trainers &   │
│ Plans        │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Content Service      │
│ Retrieve Plans       │
│ (from cache/DB)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User Selects Plan    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Training Service             │
│ 1. Create Workout Session    │
│ 2. Enroll User in Plan       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Email Service        │
│ Send Confirmation    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Analytics Service    │
│ Track Enrollment     │
└──────────────────────┘
```

## 3. Payment Processing Flow (Saga Pattern)

```
┌──────────────────┐
│ User Initiates   │
│ Payment          │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────┐
│ Payment Service             │
│ 1. Create Payment Record    │
│    (status: pending)        │
│ 2. Create Subscription      │
│    (status: pending_payment)│
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Route to Payment Gateway     │
│ (based on region/user pref)  │
└────┬────────────────────────┬┘
     │                        │
   (US/EU)              (Russia)
     │                   │
     ▼                   ├─► Yandex.Kassa
┌──────────────┐        │    (Primary)
│Stripe        │        │
│- Create      │        ├─► Sberbank
│  PaymentIntent│       │    (Secondary)
└────┬─────────┘        │
     │                  └─► WebMoney
     │                      (Tertiary)
     ▼
┌──────────────────────────┐
│ Client completes payment │
│ (3D Secure if required)  │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Payment Gateway confirms │
│ Webhook: payment.success │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────────┐
│ Payment Service          │
│ Idempotent Processing:   │
│ 1. Verify webhook sig    │
│ 2. Check idempotency key │
│ 3. Mark payment success  │
│ 4. Publish event:        │
│    payment.completed     │
└────┬─────────────────────┘
     │
     ├──────┬──────────┬─────────┐
     ▼      ▼          ▼         ▼
  ┌─────────────┐  ┌─────────┐  ┌──────────┐
  │Subscription │  │Analytics │  │Email     │
  │Service      │  │Service   │  │Service   │
  │             │  │          │  │          │
  │Activate sub │  │Log conv  │  │Send conf │
  │Grant access │  │Update    │  │Unlock    │
  │Renew date   │  │metrics   │  │content   │
  └─────────────┘  └─────────┘  └──────────┘
```

## 4. Health Data Integration Flow

```
┌──────────────────┐
│ User Links       │
│ Health App       │
│ (Apple/Google)   │
└────────┬─────────┘
         │
         ▼
┌────────────────────────────┐
│ Health Integration Service │
│ 1. Initiate OAuth flow     │
│ 2. Request permissions     │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────┐
│ Health App (Apple/     │
│ Google) Authorization  │
└────────┬───────────────┘
         │
         ▼
┌────────────────────────┐
│ Return to Service      │
│ - Access Token         │
│ - Refresh Token        │
└────────┬───────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Health Integration Service  │
│ 1. Store encrypted tokens   │
│    (AWS KMS encrypted)      │
│ 2. Queue initial sync job   │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Background Job (Lambda/      │
│ ECS Task)                    │
│ 1. Fetch health data from    │
│    Apple Health/Google Fit   │
│ 2. Normalize units/formats   │
│ 3. Store in health_metrics   │
│ 4. Update health_goals       │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────────┐
│PostgreSQL  │Redis Cache   │
│health_metrics  │User stats     │
│health_integrations│Daily summary │
└─────────┘  └──────────────┘
    │          │
    └────┬─────┘
         │
         ▼
┌──────────────────────────┐
│ Analytics Service        │
│ Update health dashboards │
└──────────────────────────┘

Daily Sync (Background):
┌────────────────────────────────────────┐
│ Every 24 hours (scheduled Lambda)      │
│ 1. Check all active integrations       │
│ 2. Fetch new data from health apps     │
│ 3. Increment sync counter              │
│ 4. Update last_sync_at timestamp       │
│ 5. Process AI recommendations          │
└────────────────────────────────────────┘
```

## 5. Recommendation Engine Flow

```
┌──────────────┐
│ User Views   │
│ Dashboard    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ API Request: GET /recommend │
│ Include: userId, context    │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ API Service                 │
│ 1. Check Redis cache        │
│    (5-minute TTL)           │
└──────┬──────────────────────┘
       │
       ├─ Cache HIT  ─────────────────┐
       │                              │
       └─ Cache MISS ┐
                     │
                     ▼
         ┌─────────────────────────────┐
         │ Feature Store (Redis/API)   │
         │ 1. Get user profile         │
         │ 2. Get engagement history   │
         │ 3. Get health metrics       │
         │ 4. Get completion rates     │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ AI Recommendation Service   │
         │ (FastAPI Python)            │
         │                             │
         │ POST /recommendations       │
         │ {                           │
         │   userId,                   │
         │   features: {               │
         │     fitness_level,          │
         │     preferences,            │
         │     completion_rate,        │
         │     health_metrics          │
         │   }                         │
         │ }                           │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ ML Model Inference          │
         │ (AWS SageMaker endpoint)    │
         │ 1. Score all plans/content  │
         │ 2. Rank by relevance        │
         │ 3. Filter by constraints    │
         │ 4. Return top 10            │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ Response to API Service     │
         │ {                           │
         │   recommendations: [        │
         │     {id, score, reason},    │
         │     ...                     │
         │   ]                         │
         │ }                           │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ Cache in Redis (5 min)      │
         │ Publish recommendation.     │
         │ generated event             │
         └──────────┬──────────────────┘
                    │
                    ▼
         ┌─────────────────────────────┐
         │ Analytics Service           │
         │ Track recommendation views  │
         │ and clicks                  │
         └─────────────────────────────┘
        │
        └─────────────────────┐
                              │
                              ▼
                    ┌─────────────────────┐
                    │ Return to Client    │
                    │ Display             │
                    │ Recommendations     │
                    └─────────────────────┘
```

## 6. Content Upload & Processing Flow

```
┌────────────┐
│ Trainer    │
│ Uploads    │
│ Video      │
└────────┬───┘
         │
         ▼
┌──────────────────────┐
│ Content Service      │
│ Validate Upload:     │
│ - Size check         │
│ - Format check       │
│ - Virus scan         │
└──────┬───────────────┘
       │
       ├─ Invalid ──► Reject
       │
       └─ Valid ─────┐
                     │
                     ▼
         ┌─────────────────────┐
         │ Generate Pre-signed │
         │ S3 Upload URL       │
         └──────┬──────────────┘
                │
                ▼
         ┌─────────────────────┐
         │ Client Uploads to   │
         │ S3 (direct)         │
         │ S3 → SQS: object.   │
         │ created event       │
         └──────┬──────────────┘
                │
                ▼
         ┌──────────────────────────┐
         │ Lambda Trigger           │
         │ (S3 Event)               │
         │ AWS Elemental           │
         │ MediaConvert Job:        │
         │ - Encode to HLS/DASH     │
         │ - Multi-bitrate          │
         │ - Generate thumbnails    │
         └──────┬───────────────────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
   ┌──────────┐  ┌──────────────┐
   │Primary   │  │Thumbnails    │
   │HLS Streams│  │Generated     │
   │(480-4K)   │  │              │
   └──────┬───┘  └──────┬───────┘
          │             │
          └──────┬──────┘
                 │
                 ▼
     ┌───────────────────────┐
     │ Content Service       │
     │ 1. Update content_item│
     │    - status: ready    │
     │ 2. Store metadata     │
     │    - duration         │
     │    - bitrates         │
     │ 3. Publish event:     │
     │    content.ready      │
     └──────┬────────────────┘
            │
         ┌──┴──┐
         │     │
         ▼     ▼
    ┌─────────┐  ┌──────────────┐
    │CDN Cache│  │Email Trainer │
    │Invalidate  │"Content Live" │
    └─────────┘  └──────────────┘
```

## 7. Workout Execution Flow

```
┌───────────────┐
│ User Starts   │
│ Workout       │
└───────┬───────┘
        │
        ▼
┌──────────────────────┐
│ Training Service     │
│ Create Workout       │
│ Execution Record     │
└──────┬───────────────┘
        │
        ▼
┌──────────────────────────┐
│ For Each Exercise:       │
│                          │
│ 1. Display instructions  │
│ 2. Start timer          │
│ 3. Track reps/duration  │
└──────┬───────────────────┘
        │
        ├─ User Completes ┐
        │ Exercise        │
        │                 │
        ▼                 ▼
    ┌─────────┐    ┌────────────┐
    │Log reps │    │Log duration│
    └────┬────┘    └────┬───────┘
         │              │
         └──────┬───────┘
                │
                ▼
        ┌──────────────────┐
        │More exercises?   │
        │ Yes: Repeat      │
        │ No: Continue     │
        └──────┬───────────┘
               │
               ▼
        ┌──────────────────────┐
        │ Workout Complete     │
        │ Calculate Summary:   │
        │ - Duration          │
        │ - Total sets/reps   │
        │ - Calories burned   │
        │ - Performance score │
        └──────┬───────────────┘
               │
         ┌─────┼─────┐
         │     │     │
         ▼     ▼     ▼
    ┌────────┐  ┌────────┐  ┌──────────┐
    │Training │  │Analytics│  │Health   │
    │Service  │  │Service  │  │Metrics  │
    │         │  │         │  │Service  │
    │Save logs│  │Track    │  │Log      │
    │Update   │  │workouts │  │activity │
    │progress │  │Log stats│  │         │
    └────────┘  └────────┘  └──────────┘
         │         │            │
         └─────┬───┴────────┬───┘
               │            │
               ▼            ▼
    ┌──────────────┐  ┌──────────────┐
    │Achievement   │  │Health Data   │
    │Service       │  │Integration   │
    │              │  │              │
    │Check badges  │  │Sync to Apple │
    │Unlock trophies│  │Health/Google │
    └──────────────┘  └──────────────┘
```

## 8. Event-Driven Architecture

```
┌──────────────────────────────────────────────┐
│         Event Bus (AWS SQS/SNS)             │
├──────────────────────────────────────────────┤
│                                              │
│  Domain Events Published:                   │
│  - user.created                             │
│  - user.email_verified                      │
│  - subscription.activated                   │
│  - payment.completed                        │
│  - payment.failed                           │
│  - content.uploaded                         │
│  - content.ready                            │
│  - workout.completed                        │
│  - health_metric.synced                     │
│  - recommendation.generated                 │
│                                              │
└────┬─────┬─────┬─────┬─────┬──────┬────────┘
     │     │     │     │     │      │
     ▼     ▼     ▼     ▼     ▼      ▼
  ┌─────────────────────────────────────┐
  │ Event Subscribers (SQS/SNS Queues)  │
  │                                     │
  │ Queue: email-notifications          │
  │  └─► Lambda: send_email             │
  │                                     │
  │ Queue: analytics-events             │
  │  └─► Lambda: aggregate_events       │
  │                                     │
  │ Queue: content-processing           │
  │  └─► Lambda: encode_video           │
  │                                     │
  │ Queue: health-integration           │
  │  └─► Lambda: sync_health_data       │
  │                                     │
  │ Queue: ai-training                  │
  │  └─► ML Service: train_model        │
  │                                     │
  │ Stream: real-time-analytics         │
  │  └─► Analytics Service              │
  │                                     │
  └─────────────────────────────────────┘
```

## Key Data Flow Principles

1. **Idempotency**: All operations can be safely retried
2. **Event Sourcing**: Important events captured and stored
3. **SAGA Pattern**: Multi-step transactions use compensating transactions
4. **Circuit Breakers**: Prevent cascading failures
5. **Asynchronous Processing**: Heavy workloads moved to background jobs
6. **Caching**: Redis caches frequent reads (5-15 minute TTL)
7. **Database Connection Pooling**: Efficient database resource usage
8. **Error Handling**: Retry with exponential backoff, dead-letter queues for analysis
