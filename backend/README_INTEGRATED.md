# Dashboard Backend API (Integrated)

A comprehensive backend service that aggregates data from multiple microservices including Habits Backend, Training Backend, and Video Infrastructure.

## Features

- **Daily Motivational Content**: Rotating inspirational quotes delivered daily
- **Integrated Habit Tracking**: Connects to Habits Backend API with local fallback
- **Training Progress Monitoring**: Integrates with Training Backend for workout plans and progress
- **Quick Links**: Organized shortcuts to various application features
- **Automated Schedulers**: 
  - Daily habit list rollover at midnight UTC
  - Progress computation every 6 hours
- **Microservices Integration**: 
  - Habits Backend (NestJS/TypeORM)
  - Training Backend (Python/Flask/SQLAlchemy)
  - Video Infrastructure
- **Fallback Mode**: Automatically falls back to local data when external services are unavailable

## Architecture

The Dashboard Backend acts as an aggregation layer that:
1. Fetches data from external microservices when available
2. Falls back to local JSON storage when services are unavailable
3. Provides a unified API for frontend applications
4. Includes source information in responses to indicate data origin

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy the example environment file and configure integration settings:

```bash
cp .env.example .env
```

Edit `.env` to configure service integrations:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# External Service Integration
ENABLE_HABITS_INTEGRATION=false     # Set to true when Habits Backend is available
ENABLE_TRAINING_INTEGRATION=false   # Set to true when Training Backend is available
ENABLE_VIDEO_INTEGRATION=false      # Set to true when Video service is available

# Service URLs
HABITS_API_URL=http://localhost:3000
TRAINING_API_URL=http://localhost:5000
VIDEO_API_URL=http://localhost:4000

# Fallback Mode
FALLBACK_MODE=true  # If true, uses local data when external services fail
```

## Running the Server

### Standard Mode (Local Data Only)
```bash
npm start
```

Runs on port 3000 with only local JSON data.

### Integrated Mode (With External Services)
```bash
npm run start:integrated
```

Runs on port 3001 with external service integration based on `.env` configuration.

### Development Mode
```bash
npm run dev              # Local data only
npm run dev:integrated   # With external services
```

## Running Tests

```bash
npm test
```

Tests cover:
- Service layer integration logic
- Fallback behavior
- API endpoints with and without external services
- User context extraction

## API Endpoints

All endpoints support both integrated and local modes. Responses include a `source` field indicating data origin (`habits-api`, `training-api`, or `local`).

### Dashboard

- `GET /api/dashboard` - Get complete dashboard data with all aggregated information
- `GET /api/dashboard/summary` - Get dashboard summary with key metrics
- `GET /api/dashboard/local` - Get data from local storage only (bypass integrations)

### Motivation

- `GET /api/dashboard/motivation` - Get daily motivational quote

### Habits

- `GET /api/dashboard/habits` - Get habit checklist with completion summary
- `POST /api/dashboard/habits/:id/toggle` - Toggle habit completion status
- `POST /api/dashboard/habits/reset` - Manually reset all habits

**Headers for Habits API Integration:**
- `Authorization: Bearer <jwt_token>` - JWT token from Habits Backend
- `x-user-id: <user_id>` - User ID for fetching user-specific habits

### Workouts / Training

- `GET /api/dashboard/workouts` - Get weekly workout progress and statistics
- `GET /api/dashboard/workouts/plan` - Get current week training plan
- `GET /api/dashboard/workouts/history?limit=5` - Get training history
- `POST /api/dashboard/workouts` - Add a new workout (local only)

**Headers for Training API Integration:**
- `x-user-id: <user_id>` - User ID for fetching user-specific training data

### Quick Links

- `GET /api/dashboard/quick-links` - Get all quick links with categories

### Progress

- `GET /api/dashboard/progress` - Get computed progress data
- `POST /api/dashboard/progress/compute` - Manually trigger progress computation

### Health Check

- `GET /health` - Health status with integration configuration

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data with source information
    "source": "habits-api" | "training-api" | "local"
  }
}
```

Dashboard responses include integration status:

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "motivation": { ... },
    "habits": {
      "checklist": [...],
      "summary": { ... },
      "source": "habits-api"
    },
    "workouts": {
      "weeklyProgress": { ... },
      "source": "training-api"
    },
    "integrations": {
      "habits": "habits-api",
      "workouts": "training-api"
    }
  }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Integration Details

### Habits Backend Integration

When `ENABLE_HABITS_INTEGRATION=true`:
- Fetches user habits from NestJS Habits Backend
- Retrieves today's completions
- Supports habit toggling through external API
- Includes streak information
- Falls back to local data if API unavailable

**Required Headers:**
- `Authorization: Bearer <token>` - JWT token from Habits Backend
- `x-user-id: <user_id>` - User identifier

### Training Backend Integration

When `ENABLE_TRAINING_INTEGRATION=true`:
- Fetches current week training plan from Flask Training Backend
- Retrieves training history
- Calculates workout completion statistics
- Provides weekly progress summaries
- Falls back to local data if API unavailable

**Required Headers:**
- `x-user-id: <user_id>` - User identifier

### Video Infrastructure Integration

When `ENABLE_VIDEO_INTEGRATION=true`:
- Ready for video metadata integration
- Supports exercise video associations
- Falls back gracefully if unavailable

## Fallback Behavior

When `FALLBACK_MODE=true` (default):
1. Dashboard attempts to fetch data from external services
2. If service is unavailable or returns an error:
   - Logs the error
   - Falls back to local JSON data
   - Continues serving the request
   - Marks response with `source: "local"`

When `FALLBACK_MODE=false`:
- Errors from external services are propagated to the client
- No fallback to local data
- Useful for debugging integration issues

## Schedulers

### Habit Scheduler
- Runs daily at midnight UTC
- Resets local habit data
- Does not affect external Habits Backend (handled by that service)

### Progress Scheduler
- Runs every 6 hours
- Computes and caches workout and habit statistics
- Uses integrated services when available
- Falls back to local data

## Testing Strategy

Tests are designed to work without external services:
- Mock external API calls
- Test fallback behavior
- Verify source information in responses
- Ensure graceful degradation

## Data Storage

Local fallback data is stored in JSON files in the `data/` directory:
- `habits.json` - Habit definitions and completion status
- `workouts.json` - Workout history and details

These files are auto-generated on first run and used as fallback data.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│         Dashboard Backend (Node.js)         │
│                                             │
│  ┌─────────────────────────────────────┐  │
│  │    API Routes (Express)              │  │
│  └────────────┬─────────────────────────┘  │
│               │                             │
│  ┌────────────▼─────────────────────────┐  │
│  │  Dashboard Service (Aggregation)     │  │
│  └────┬───────────────────────┬─────────┘  │
│       │                       │             │
│  ┌────▼──────────┐   ┌───────▼─────────┐  │
│  │ Habit Service │   │ Workout Service │  │
│  │  Integrated   │   │   Integrated    │  │
│  └────┬──────────┘   └───────┬─────────┘  │
│       │                      │             │
└───────┼──────────────────────┼─────────────┘
        │                      │
        │  HTTP Clients        │
        │                      │
┌───────▼──────────┐  ┌────────▼──────────┐
│  Habits Backend  │  │ Training Backend  │
│   (NestJS)       │  │  (Flask/Python)   │
│   Port 3000      │  │   Port 5000       │
└──────────────────┘  └───────────────────┘
        │                      │
        │  Fallback            │
        ▼                      ▼
   ┌──────────────────────────────┐
   │    Local JSON Storage        │
   │  (habits.json, workouts.json)│
   └──────────────────────────────┘
```

## Migration Guide

### From Local-Only to Integrated Mode

1. **Start with Local Mode:**
   ```bash
   npm start  # Runs on port 3000
   ```

2. **Set up external services:**
   - Deploy Habits Backend (NestJS) on port 3000
   - Deploy Training Backend (Flask) on port 5000

3. **Configure integration:**
   ```env
   PORT=3001  # Use different port to avoid conflict
   ENABLE_HABITS_INTEGRATION=true
   ENABLE_TRAINING_INTEGRATION=true
   HABITS_API_URL=http://localhost:3000
   TRAINING_API_URL=http://localhost:5000
   FALLBACK_MODE=true
   ```

4. **Run integrated mode:**
   ```bash
   npm run start:integrated  # Runs on port 3001
   ```

5. **Test integration:**
   - Access `/health` endpoint to verify service connectivity
   - Check response `source` fields to confirm data origin
   - Test fallback by stopping external services

## Troubleshooting

### External service connection issues

Check `/health` endpoint for integration status:
```bash
curl http://localhost:3001/health
```

### Fallback not working

Ensure `FALLBACK_MODE=true` in `.env` file.

### Mixed data sources

Responses will indicate source:
- `source: "habits-api"` - Data from Habits Backend
- `source: "training-api"` - Data from Training Backend  
- `source: "local"` - Data from local JSON files

Check logs for connection errors to external services.

## Contributing

When adding new integrations:
1. Create client in `clients/` directory
2. Create integrated service in `services/` 
3. Update routes to use integrated service
4. Add configuration to `config/services.js`
5. Update `.env.example`
6. Add tests for fallback behavior
7. Update this README

## License

ISC
