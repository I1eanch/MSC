# Training Backend API

A comprehensive backend system for managing weekly training plans, workouts, exercises, and trainer assignments.

## Features

- **Data Models**: Weekly training plans, workouts, exercises, video metadata, completion logs, and summaries
- **Trainer Assignment**: Assign personal trainers to training plans
- **Summary Generation**: Automatic weekly summary generation with completion tracking
- **Motivational Messages**: Weekly motivational messages based on week number and progress
- **Completion Tracking**: Track workout and exercise completion with detailed logs
- **History**: View training plan history and exercise completion logs

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python run.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Trainers

#### Create Trainer
```
POST /api/training/trainers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "specialization": "Strength Training"
}
```

#### Get All Trainers
```
GET /api/training/trainers
```

#### Get Trainer by ID
```
GET /api/training/trainers/{trainer_id}
```

### Training Plans

#### Create Training Plan
```
POST /api/training/plans
Content-Type: application/json

{
  "user_id": 1,
  "week_number": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-07",
  "workouts": [
    {
      "day_of_week": 1,
      "workout_name": "Monday Push Day",
      "description": "Chest and triceps",
      "duration_minutes": 60,
      "exercises": [
        {
          "exercise_name": "Bench Press",
          "sets": 3,
          "reps": 10,
          "notes": "Focus on form"
        }
      ]
    }
  ]
}
```

#### Get Training Plan
```
GET /api/training/plans/{plan_id}
```

#### Get Current Week Plan
```
GET /api/training/plans/user/{user_id}/current
```

#### Get Training History
```
GET /api/training/plans/user/{user_id}/history?limit=10
```

#### Assign Trainer to Plan
```
PUT /api/training/plans/{plan_id}/assign-trainer
Content-Type: application/json

{
  "trainer_id": 1
}
```

#### Get Weekly Summary
```
GET /api/training/plans/{plan_id}/summary
```

### Workouts

#### Complete Workout
```
PUT /api/training/workouts/{workout_id}/complete
Content-Type: application/json

{
  "completed": true
}
```

### Exercises

#### Log Exercise Completion
```
POST /api/training/exercises/{exercise_id}/log
Content-Type: application/json

{
  "user_id": 1,
  "sets_completed": 3,
  "reps_completed": 10,
  "duration_seconds": 180,
  "notes": "Felt strong today"
}
```

#### Get Exercise History
```
GET /api/training/exercises/{exercise_id}/history?limit=10
```

## Data Models

### Trainer
- `id`: Unique identifier
- `name`: Trainer's name
- `email`: Trainer's email (unique)
- `specialization`: Area of expertise
- `created_at`: Creation timestamp

### TrainingPlan
- `id`: Unique identifier
- `user_id`: Associated user
- `trainer_id`: Assigned trainer (optional)
- `week_number`: Week number in the program
- `start_date`: Week start date
- `end_date`: Week end date
- `motivational_message`: Auto-generated motivational message
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Workout
- `id`: Unique identifier
- `training_plan_id`: Associated plan
- `day_of_week`: Day number (1-7)
- `workout_name`: Name of the workout
- `description`: Workout description
- `duration_minutes`: Expected duration
- `completed`: Completion status
- `completed_at`: Completion timestamp
- `created_at`: Creation timestamp

### Exercise
- `id`: Unique identifier
- `workout_id`: Associated workout
- `exercise_name`: Name of the exercise
- `sets`: Number of sets
- `reps`: Repetitions per set
- `duration_seconds`: Duration for timed exercises
- `notes`: Additional notes
- `order_index`: Order in the workout
- `created_at`: Creation timestamp

### VideoMetadata
- `id`: Unique identifier
- `exercise_id`: Associated exercise
- `video_url`: URL to the video
- `thumbnail_url`: URL to the thumbnail
- `duration_seconds`: Video duration
- `video_title`: Title of the video
- `created_at`: Creation timestamp

### CompletionLog
- `id`: Unique identifier
- `exercise_id`: Associated exercise
- `user_id`: User who completed
- `completed_at`: Completion timestamp
- `sets_completed`: Sets completed
- `reps_completed`: Reps completed
- `duration_completed_seconds`: Duration completed
- `notes`: Completion notes

### WeeklySummary
- `id`: Unique identifier
- `training_plan_id`: Associated plan
- `total_workouts`: Total number of workouts
- `completed_workouts`: Number of completed workouts
- `total_exercises`: Total number of exercises
- `completion_percentage`: Overall completion percentage
- `total_duration_minutes`: Total workout duration
- `trainer_feedback`: Auto-generated feedback
- `generated_at`: Generation timestamp

## Testing

Run the test suite:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app tests/
```

## Features Implementation

### Trainer Assignment Workflow
- Trainers can be created and assigned to training plans
- Plans can be updated with trainer assignments
- Trainer information is included in plan responses

### Summary Generation
- Automatic calculation of completion statistics
- Trainer feedback based on completion percentage
- Tracks total workouts, exercises, and duration

### Weekly Motivational Messages
- Week 1: Special welcome message
- Every 4th week: Milestone encouragement
- Other weeks: Random motivational message from pool

### Plan Progression
- Plans are ordered by start date
- History endpoint provides chronological view
- Current week plan can be easily retrieved
- Tests cover multi-week progression scenarios
