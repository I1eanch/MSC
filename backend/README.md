# Dashboard Backend API

A comprehensive backend service providing daily motivational content, habit tracking, workout progress monitoring, and quick links management.

## Features

- **Daily Motivational Content**: Rotating inspirational quotes delivered daily
- **Habit Checklist**: Track and manage daily habits with completion statistics
- **Weekly Workout Progress**: Monitor workout activities with detailed analytics
- **Quick Links**: Organized shortcuts to various application features
- **Automated Schedulers**: 
  - Daily habit list rollover at midnight UTC
  - Progress computation every 6 hours

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
npm start
```

The server will start on port 3000 (or the port specified in the PORT environment variable).

## Development

```bash
npm run dev
```

## Running Tests

```bash
npm test
```

## API Endpoints

### Dashboard

- `GET /api/dashboard` - Get complete dashboard data with all aggregated information
- `GET /api/dashboard/summary` - Get dashboard summary with key metrics

### Motivation

- `GET /api/dashboard/motivation` - Get daily motivational quote

### Habits

- `GET /api/dashboard/habits` - Get habit checklist with completion summary
- `POST /api/dashboard/habits/:id/toggle` - Toggle habit completion status
- `POST /api/dashboard/habits/reset` - Manually reset all habits

### Workouts

- `GET /api/dashboard/workouts` - Get weekly workout progress and statistics
- `POST /api/dashboard/workouts` - Add a new workout

### Quick Links

- `GET /api/dashboard/quick-links` - Get all quick links with categories

### Progress

- `GET /api/dashboard/progress` - Get computed progress data
- `POST /api/dashboard/progress/compute` - Manually trigger progress computation

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {
    // Response data
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

## Example Dashboard Response

```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "motivation": {
      "daily": {
        "quote": {
          "id": 1,
          "text": "The only way to do great work is to love what you do.",
          "author": "Steve Jobs",
          "category": "inspiration"
        },
        "date": "2024-01-01"
      }
    },
    "habits": {
      "checklist": [...],
      "summary": {
        "total": 5,
        "completed": 3,
        "percentage": 60
      },
      "lastReset": "2024-01-01"
    },
    "workouts": {
      "weeklyProgress": {
        "totalWorkouts": 6,
        "totalDuration": 270,
        "totalCalories": 1530,
        "averageDuration": 45,
        "averageCalories": 255
      },
      "breakdown": {...},
      "recentWorkouts": [...],
      "period": {
        "start": "2023-12-25",
        "end": "2024-01-01"
      }
    },
    "quickLinks": {
      "links": [...],
      "categories": [...]
    },
    "summary": {
      "habitsCompleted": 3,
      "habitsTotal": 5,
      "habitsPercentage": 60,
      "weeklyWorkouts": 6,
      "weeklyCalories": 1530
    }
  }
}
```

## Schedulers

### Habit Scheduler
- Runs daily at midnight UTC
- Automatically resets all habits to incomplete
- Updates last reset date

### Progress Scheduler
- Runs every 6 hours
- Computes and caches workout and habit statistics
- Provides quick access to aggregated progress data

## Testing

The project includes comprehensive unit tests covering:
- Service layer data aggregation
- Scheduler operations
- API endpoint integration
- Error handling

Test coverage reports are generated in the `coverage/` directory.

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `habits.json` - Habit definitions and completion status
- `workouts.json` - Workout history and details

## Architecture

```
backend/
├── services/          # Business logic and data aggregation
│   ├── motivationalService.js
│   ├── habitService.js
│   ├── workoutService.js
│   ├── quickLinksService.js
│   └── dashboardService.js
├── scheduler/         # Automated tasks
│   ├── habitScheduler.js
│   └── progressScheduler.js
├── routes/           # API endpoints
│   └── dashboard.js
├── tests/            # Unit and integration tests
├── data/             # JSON data storage
└── server.js         # Main application entry point
```
