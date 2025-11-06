# Dashboard Backend Implementation

## Overview

This implementation adds a complete backend service to provide dashboard functionality with daily motivational content, habit tracking, workout progress monitoring, and quick links management.

**Update**: The Dashboard Backend now includes integration capabilities with external microservices from Packages 1-2 (Habits Backend, Training Backend, Video Infrastructure) while maintaining backward compatibility with local-only mode.

## Architecture

### Services Layer (`backend/services/`)

1. **motivationalService.js**
   - Provides daily rotating motivational quotes
   - 10 curated quotes with categories
   - Day-based selection ensures consistency throughout the day

2. **habitService.js**
   - Manages daily habit checklist
   - Tracks completion status
   - Calculates progress percentages
   - Persists data to JSON file

3. **workoutService.js**
   - Tracks workout activities
   - Computes weekly progress summaries
   - Aggregates statistics by workout type
   - Calculates averages and totals

4. **quickLinksService.js**
   - Provides quick access links
   - Organizes links by category
   - 6 pre-defined links across different categories

5. **dashboardService.js**
   - Aggregates data from all services
   - Provides unified dashboard payload
   - Computes summary statistics

6. **habitServiceIntegrated.js** (New)
   - Integrates with external Habits Backend API
   - Falls back to local habitService when API unavailable
   - Supports JWT authentication
   - Tracks data source in responses

7. **workoutServiceIntegrated.js** (New)
   - Integrates with external Training Backend API
   - Falls back to local workoutService when API unavailable
   - Provides training plan and history data
   - Tracks data source in responses

8. **dashboardServiceIntegrated.js** (New)
   - Aggregates data from integrated services
   - Handles mixed data sources
   - Includes integration status in responses

### Scheduler Layer (`backend/scheduler/`)

1. **habitScheduler.js**
   - Runs daily at midnight UTC
   - Automatically resets all habits to incomplete
   - Updates last reset date
   - Supports manual rollover for testing

2. **progressScheduler.js**
   - Runs every 6 hours
   - Computes and caches workout/habit progress
   - Provides quick access to aggregated statistics
   - Supports manual computation

### Client Layer (`backend/clients/`) (New)

1. **habitsClient.js**
   - HTTP client for Habits Backend API (NestJS)
   - Handles JWT authentication
   - Fetches user habits and completions
   - Supports habit toggling

2. **trainingClient.js**
   - HTTP client for Training Backend API (Flask)
   - Fetches training plans and history
   - Calculates workout progress
   - Retrieves weekly summaries

### Routes Layer (`backend/routes/`)

**Dashboard Routes** (`/api/dashboard` - Local only)
- `GET /` - Complete dashboard data
- `GET /summary` - Dashboard summary
- `GET /motivation` - Daily motivation
- `GET /habits` - Habit checklist
- `POST /habits/:id/toggle` - Toggle habit
- `POST /habits/reset` - Reset all habits
- `GET /workouts` - Weekly workout progress
- `POST /workouts` - Add new workout
- `GET /quick-links` - Quick links
- `GET /progress` - Computed progress
- `POST /progress/compute` - Manual progress computation

**Dashboard Integrated Routes** (`/api/dashboard` - With external services)
- All endpoints from above, plus:
- `GET /workouts/plan` - Current week training plan
- `GET /workouts/history` - Training history
- All responses include `source` field
- Supports JWT and user ID headers

## Test Coverage

- **76 passing tests** covering all services, schedulers, and API endpoints
- **87.5% code coverage** overall
- Unit tests for each service
- Integration tests for API endpoints
- Scheduler functionality tests

## Data Storage

- JSON file-based storage for simplicity
- Files created automatically on first use
- Located in `backend/data/`
- `.gitignore` configured to exclude data files

## Key Features

1. **Automated Scheduling**
   - Daily habit reset at midnight UTC
   - Progress computation every 6 hours

2. **Data Aggregation**
   - Unified dashboard payload
   - Summary statistics
   - Weekly workout analytics

3. **Error Handling**
   - Try-catch blocks in schedulers
   - Proper HTTP status codes
   - Consistent error response format

4. **Test Environment Support**
   - Schedulers disabled during tests
   - Clean test isolation
   - Comprehensive coverage

## Installation & Usage

```bash
cd backend
npm install

# Local mode (JSON data only)
npm start        # Port 3000
npm run dev      # Development mode

# Integrated mode (with external services)
npm run start:integrated  # Port 3001
npm run dev:integrated    # Development mode

# Tests
npm test         # Run all tests with coverage
```

## Configuration

Create `.env` file from example:
```bash
cp .env.example .env
```

Configure external service integration:
```env
ENABLE_HABITS_INTEGRATION=true
ENABLE_TRAINING_INTEGRATION=true
HABITS_API_URL=http://localhost:3000
TRAINING_API_URL=http://localhost:5000
FALLBACK_MODE=true
```

## API Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Technologies Used

- **Express.js** - Web framework
- **node-cron** - Job scheduling
- **Jest** - Testing framework
- **Supertest** - API testing
- **CORS** - Cross-origin support
- **Axios** - HTTP client for service integration
- **dotenv** - Environment configuration

## Integration with External Services

The Dashboard Backend integrates with:

1. **Habits Backend** (NestJS/TypeScript)
   - User habits and completions
   - Streak tracking
   - JWT authentication

2. **Training Backend** (Python/Flask)
   - Weekly training plans
   - Workout completion tracking
   - Training history

3. **Video Infrastructure** (Planned)
   - Exercise videos
   - Content delivery

See `INTEGRATION.md` for detailed integration guide.

## Acceptance Criteria ✅

✅ API returns assembled dashboard payload  
✅ Unit tests cover data aggregation  
✅ Services deliver daily motivational content  
✅ Habit checklist definitions implemented  
✅ Weekly workout progress summary available  
✅ Quick links metadata provided  
✅ Scheduler rolls over habit list  
✅ Scheduler computes progress
✅ Integration with Habits Backend (NestJS)
✅ Integration with Training Backend (Flask)
✅ Fallback to local data when services unavailable
✅ Source tracking in responses
✅ Configuration via environment variables
