# Profile API v2 - User Service

This module provides comprehensive user profile management with personal goals, progress photos, and metrics tracking.

## Features

- **User Management**: Profile information, preferences, and settings
- **Goal Tracking**: Set, update, and monitor personal fitness goals
- **Progress Photos**: Secure photo storage with S3 integration and scanning
- **Metrics Tracking**: Record and analyze body measurements and weight
- **Progress Analytics**: Comprehensive progress summaries and insights

## API Endpoints

### User Profile

#### `GET /users/profile`
Get current user profile information.

#### `PUT /users/profile`
Update user profile information.

#### `GET /users/progress`
Get comprehensive progress summary including goals, photos, and metrics.

### Goals

#### `POST /users/goals`
Create a new personal goal.

**Request Body:**
```json
{
  "title": "Lose 10kg in 3 months",
  "description": "Focus on cardio and healthy eating",
  "type": "weight_loss",
  "targetValue": {
    "weight": 70
  },
  "targetDate": "2024-12-31",
  "startDate": "2024-01-01"
}
```

#### `GET /users/goals`
Get user's goals with optional status filtering.

**Query Parameters:**
- `status` (optional): Filter by goal status (active, completed, paused, cancelled)

#### `GET /users/goals/:goalId`
Get a specific goal by ID.

#### `PUT /users/goals/:goalId`
Update goal information.

#### `PUT /users/goals/:goalId/progress`
Update goal progress with automatic percentage calculation.

**Request Body:**
```json
{
  "currentWeight": 75.5,
  "currentBodyFat": 18.5,
  "percentageComplete": 60
}
```

#### `DELETE /users/goals/:goalId`
Delete a goal.

### Progress Photos

#### `POST /users/photos/upload-url`
Generate a signed URL for secure photo upload to S3.

**Request Body:**
```json
{
  "filename": "progress-2024-01-15.jpg",
  "originalName": "Front pose progress photo",
  "notes": "Feeling good about the progress!"
}
```

#### `POST /users/photos`
Create a photo record after successful upload.

#### `GET /users/photos`
Get user's progress photos with pagination.

**Query Parameters:**
- `limit` (optional): Number of photos to return (default: 50)
- `offset` (optional): Number of photos to skip (default: 0)

#### `GET /users/photos/:photoId`
Get a specific photo by ID.

#### `GET /users/photos/:photoId/download-url`
Generate a signed URL for secure photo download.

#### `DELETE /users/photos/:photoId`
Delete a photo and its S3 file.

### Metrics

#### `POST /users/metrics`
Create a new metric record.

**Request Body:**
```json
{
  "type": "weight",
  "value": 75.5,
  "unit": "kg",
  "recordedDate": "2024-01-15",
  "notes": "Morning weight after workout",
  "additionalData": {
    "timeOfDay": "morning",
    "afterWorkout": true
  }
}
```

#### `GET /users/metrics`
Get user's metrics with filtering and pagination.

**Query Parameters:**
- `type` (optional): Filter by metric type
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `limit` (optional): Number of metrics to return (default: 50)
- `offset` (optional): Number of metrics to skip (default: 0)

#### `GET /users/metrics/:metricId`
Get a specific metric by ID.

#### `PUT /users/metrics/:metricId`
Update a metric record.

#### `DELETE /users/metrics/:metricId`
Delete a metric record.

## Goal Types

- `weight_loss`: For losing weight goals
- `weight_gain`: For gaining weight goals
- `muscle_gain`: For building muscle mass
- `endurance`: For improving cardiovascular endurance
- `strength`: For increasing strength
- `custom`: For custom goal types

## Metric Types

- `weight`: Body weight
- `body_fat`: Body fat percentage
- `muscle_mass`: Muscle mass
- `chest`: Chest measurement
- `waist`: Waist measurement
- `hips`: Hips measurement
- `arms`: Arms measurement
- `thighs`: Thighs measurement
- `calves`: Calves measurement
- `custom`: Custom metric types

## Photo Security

- All photos are stored securely in AWS S3
- Photos undergo automated security scanning
- Upload URLs are signed and expire after 1 hour
- Download URLs are signed and expire after 1 hour
- Photos with failed security scans are blocked from download

## Progress Calculation

The system automatically calculates goal progress based on:

1. **Weight Loss Goals**: `(startWeight - currentWeight) / (startWeight - targetWeight) * 100`
2. **Weight Gain Goals**: `(currentWeight - startWeight) / (targetWeight - startWeight) * 100`
3. **Manual Progress**: Can be overridden with custom percentage values

Progress is capped between 0-100% to prevent negative or over-100% values.

## Environment Variables

Required environment variables for S3 integration:

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=progress-photos-bucket
```

## Testing

The module includes comprehensive tests covering:

- Goal creation and management
- Progress calculation logic
- Metrics tracking and filtering
- Error handling and validation
- Photo upload workflows

Run tests with:
```bash
pnpm --filter backend test
```

## Database Schema

The module creates the following tables:

- `users`: User profile information
- `goals`: Personal goals with progress tracking
- `progress_photos`: Photo metadata and S3 references
- `metrics`: Body measurements and weight tracking

All tables include proper foreign key relationships with cascade deletes for data integrity.