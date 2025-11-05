# Dashboard Backend Implementation

## Overview

This implementation adds a complete backend service to provide dashboard functionality with daily motivational content, habit tracking, workout progress monitoring, and quick links management.

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

### Routes Layer (`backend/routes/`)

**Dashboard Routes** (`/api/dashboard`)
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
npm start        # Start the server
npm test         # Run tests with coverage
npm run dev      # Development mode with nodemon
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

## Acceptance Criteria ✅

✅ API returns assembled dashboard payload  
✅ Unit tests cover data aggregation  
✅ Services deliver daily motivational content  
✅ Habit checklist definitions implemented  
✅ Weekly workout progress summary available  
✅ Quick links metadata provided  
✅ Scheduler rolls over habit list  
✅ Scheduler computes progress  
