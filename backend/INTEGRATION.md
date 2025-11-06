# Dashboard Backend Integration Guide

This document explains how the Dashboard Backend integrates with external microservices from Packages 1-2.

## Overview

The Dashboard Backend acts as an **aggregation layer** that combines data from multiple specialized backend services:

1. **Habits Backend** (Package 1) - NestJS/TypeScript/TypeORM
2. **Training Backend** (Package 2) - Python/Flask/SQLAlchemy  
3. **Video Infrastructure** (Package 2) - Video processing and delivery

## Architecture Pattern

The integration follows a **Gateway/BFF (Backend for Frontend)** pattern with graceful degradation:

```
Frontend Application
        ↓
Dashboard Backend API (Port 3001)
    ↙       ↓       ↘
Habits   Training   Video
Backend  Backend  Infrastructure
(3000)   (5000)    (4000)
    ↘       ↓       ↙
    Local JSON Fallback
```

### Key Principles

1. **Loose Coupling**: Dashboard can work independently or with any combination of services
2. **Graceful Degradation**: Falls back to local data when services are unavailable
3. **Source Transparency**: All responses indicate data source
4. **Flexible Configuration**: Enable/disable services via environment variables

## Service Integrations

### 1. Habits Backend Integration

**Technology**: NestJS, TypeScript, TypeORM, PostgreSQL

**Endpoints Used**:
- `GET /habits` - Get user's habits
- `GET /habits/statistics` - Get habit statistics
- `GET /habits/completions?date=YYYY-MM-DD` - Get completions for a date
- `POST /habits/:id/complete` - Toggle habit completion

**Authentication**: JWT Bearer Token

**Data Mapping**:

Habits API → Dashboard Format:
```javascript
{
  id: habit.id,
  name: habit.name,
  description: habit.description,
  frequency: habit.frequency,
  completed: completionMap.has(habit.id),
  streak: habit.currentStreak
}
```

**Implementation**: See `clients/habitsClient.js` and `services/habitServiceIntegrated.js`

### 2. Training Backend Integration

**Technology**: Python, Flask, SQLAlchemy, PostgreSQL

**Endpoints Used**:
- `GET /api/training/plans/user/:userId/current` - Get current week plan
- `GET /api/training/plans/user/:userId/history` - Get training history
- `GET /api/training/plans/:planId/summary` - Get weekly summary
- `POST /api/training/workouts/:workoutId/complete` - Complete workout

**Authentication**: User ID in header (`x-user-id`)

**Data Mapping**:

Training API → Dashboard Format:
```javascript
{
  summary: {
    totalWorkouts: plan.workouts.length,
    completedWorkouts: completedCount,
    totalExercises: exerciseCount,
    completedExercises: completedExerciseCount,
    completionPercentage: percentage
  },
  weekNumber: plan.week_number,
  startDate: plan.start_date,
  endDate: plan.end_date
}
```

**Implementation**: See `clients/trainingClient.js` and `services/workoutServiceIntegrated.js`

### 3. Video Infrastructure Integration (Planned)

**Technology**: S3, MediaConvert, CDN

**Future Endpoints**:
- Video metadata for exercises
- Signed URLs for video playback
- DRM-protected content delivery

**Status**: Configuration ready, implementation pending

## Configuration

### Environment Variables

```env
# Enable/disable each service
ENABLE_HABITS_INTEGRATION=false
ENABLE_TRAINING_INTEGRATION=false
ENABLE_VIDEO_INTEGRATION=false

# Service endpoints
HABITS_API_URL=http://localhost:3000
TRAINING_API_URL=http://localhost:5000
VIDEO_API_URL=http://localhost:4000

# Fallback behavior
FALLBACK_MODE=true
```

### Service Configuration

Edit `config/services.js` to customize:
- Base URLs
- Timeouts
- Retry logic (future)
- Circuit breaker settings (future)

## Client Headers

### For Habits Backend

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
x-user-id: 123
```

The JWT token is obtained from Habits Backend login/register endpoints.

### For Training Backend

```
x-user-id: 123
```

The Training Backend uses user ID for authorization.

### For Dashboard Backend

Clients can pass headers through:

```javascript
// Example: Frontend request
fetch('http://localhost:3001/api/dashboard', {
  headers: {
    'Authorization': 'Bearer <habits-jwt-token>',
    'x-user-id': '123'
  }
})
```

Dashboard extracts these and forwards to appropriate services.

## Fallback Behavior

### Scenario 1: Service Available
```
Client → Dashboard → External Service → Dashboard → Client
                          ✓ 200 OK
Response includes: source: "habits-api"
```

### Scenario 2: Service Unavailable (Fallback Enabled)
```
Client → Dashboard → External Service (timeout/error)
                          ✗ Failed
              ↓
        Local JSON Data
              ↓
          Dashboard → Client
Response includes: source: "local"
```

### Scenario 3: Service Unavailable (Fallback Disabled)
```
Client → Dashboard → External Service (timeout/error)
                          ✗ Failed
              ↓
        Error Response → Client
```

## Testing Integration

### 1. Test Local Mode (No External Services)

```bash
npm test
```

All tests pass using local data.

### 2. Test with Mock Services

```bash
# Terminal 1: Start mock Habits Backend
cd mock-services
npm run habits-mock

# Terminal 2: Start mock Training Backend  
npm run training-mock

# Terminal 3: Enable integrations and test
export ENABLE_HABITS_INTEGRATION=true
export ENABLE_TRAINING_INTEGRATION=true
npm run dev:integrated
```

### 3. Test Fallback Behavior

```bash
# Start with integrations enabled
ENABLE_HABITS_INTEGRATION=true npm run dev:integrated

# Stop external service
# Dashboard should automatically fall back

# Check response source
curl http://localhost:3001/api/dashboard/habits
# Should return: "source": "local"
```

### 4. Integration Test Suite

Run integration tests:
```bash
npm test tests/integration.test.js
```

Tests cover:
- External service communication
- Fallback behavior
- Source tracking
- Header extraction
- Error handling

## Data Flow Examples

### Example 1: Get Dashboard Data

**Request:**
```http
GET /api/dashboard HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGc...
x-user-id: 123
```

**Flow:**
1. Dashboard receives request
2. Extracts userId=123 and JWT token
3. Calls Habits API: `GET http://localhost:3000/habits` with JWT
4. Calls Training API: `GET http://localhost:5000/api/training/plans/user/123/current`
5. Gets local motivational quote
6. Gets local quick links
7. Aggregates all data
8. Returns unified response with source info

**Response:**
```json
{
  "success": true,
  "data": {
    "motivation": { ... },
    "habits": {
      "checklist": [...],
      "source": "habits-api"
    },
    "workouts": {
      "weeklyProgress": { ... },
      "source": "training-api"  
    },
    "quickLinks": { ... },
    "integrations": {
      "habits": "habits-api",
      "workouts": "training-api"
    }
  }
}
```

### Example 2: Toggle Habit

**Request:**
```http
POST /api/dashboard/habits/42/toggle HTTP/1.1
Host: localhost:3001
Authorization: Bearer eyJhbGc...
x-user-id: 123
```

**Flow:**
1. Dashboard receives request with habitId=42
2. Extracts userId=123 and JWT token
3. Calls Habits API: `POST http://localhost:3000/habits/42/complete` with JWT
4. Receives updated habit data
5. Returns result with source info

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "Morning Exercise",
    "completed": true,
    "source": "habits-api"
  }
}
```

## Error Handling

### Connection Errors

```javascript
try {
  const habits = await habitsClient.getUserHabits(userId, token);
} catch (error) {
  console.error('Habits API unavailable:', error.message);
  if (config.fallbackMode) {
    return this.getLocalHabitChecklist();
  }
  throw error;
}
```

### Authentication Errors

If JWT token is invalid or expired:
- Habits API returns 401 Unauthorized
- Dashboard propagates error to client
- Client should re-authenticate with Habits Backend

### Service-Specific Errors

Each service may return specific error codes:
- 400: Validation error
- 401: Authentication error  
- 403: Authorization error
- 404: Resource not found
- 500: Internal server error

Dashboard logs these and falls back if configured.

## Migration Strategy

### Phase 1: Local Only (Current)
- All data from local JSON
- No external dependencies
- Fast development iteration

### Phase 2: Partial Integration
- Enable Habits Backend integration
- Keep Training local
- Test integration patterns

### Phase 3: Full Integration
- Enable all services
- Fallback still available
- Production-ready

### Phase 4: Service-Only Mode
- Disable fallback
- All data from services
- Alerts on service failures

## Monitoring & Observability

### Health Endpoint

```http
GET /health
```

Returns integration status:
```json
{
  "status": "healthy",
  "integrations": {
    "habits": {
      "enabled": true,
      "url": "http://localhost:3000"
    },
    "training": {
      "enabled": true,
      "url": "http://localhost:5000"
    }
  },
  "fallbackMode": true
}
```

### Logging

All integration attempts are logged:
```
[INFO] Fetching habits from Habits API for user 123
[ERROR] Habits API unavailable: ECONNREFUSED
[INFO] Falling back to local habit data
```

### Future: Metrics

Planned metrics:
- External service response times
- Fallback frequency
- Cache hit rates
- Error rates by service

## Best Practices

1. **Always check source**: Frontend should adapt UI based on data source
2. **Handle mixed sources**: Dashboard response may have habits from API and workouts local
3. **Graceful degradation**: UI should work with any combination of data sources
4. **Token management**: Frontend responsible for JWT token lifecycle
5. **User context**: Always pass user ID when available
6. **Timeout handling**: Set reasonable timeouts (default: 5 seconds)
7. **Retry logic**: Implement exponential backoff for transient failures (future)
8. **Circuit breaker**: Prevent cascade failures (future)

## Troubleshooting

### Problem: Habits always returning local data

**Check:**
1. Is `ENABLE_HABITS_INTEGRATION=true` in `.env`?
2. Is Habits Backend running on correct port?
3. Is JWT token valid?
4. Check Dashboard logs for errors

### Problem: Training API timeout

**Check:**
1. Is Training Backend running and accessible?
2. Is timeout too short? (default: 5000ms)
3. Is database connection slow?
4. Check Training Backend logs

### Problem: Mixed data sources

**This is expected behavior** when:
- Some services available, others not
- Fallback mode enabled
- Check `integrations` field in response to see actual sources

## Future Enhancements

1. **Caching**: Cache external service responses
2. **Rate Limiting**: Protect external services
3. **Circuit Breaker**: Fail fast pattern
4. **Service Discovery**: Dynamic service registration
5. **GraphQL Gateway**: Unified data graph
6. **WebSocket Support**: Real-time updates
7. **Batch Requests**: Reduce API calls
8. **Data Synchronization**: Sync between services and local cache

## References

- Habits Backend API: See `feat-habits-backend` branch
- Training Backend API: See `feat-training-backend` branch
- Video Infrastructure: See `feat-video-ingest` branch
- Gateway Pattern: https://microservices.io/patterns/apigateway.html
- BFF Pattern: https://samnewman.io/patterns/architectural/bff/
