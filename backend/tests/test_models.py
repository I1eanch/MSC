import pytest
from datetime import datetime, timedelta
from app.models import db
from app.models.training import (
    Trainer, TrainingPlan, Workout, Exercise, 
    VideoMetadata, CompletionLog, WeeklySummary
)

def test_trainer_creation(app):
    with app.app_context():
        trainer = Trainer(
            name='Jane Smith',
            email='jane@example.com',
            specialization='CrossFit'
        )
        db.session.add(trainer)
        db.session.commit()
        
        assert trainer.id is not None
        assert trainer.name == 'Jane Smith'
        assert trainer.email == 'jane@example.com'

def test_training_plan_creation(app):
    with app.app_context():
        today = datetime.utcnow().date()
        plan = TrainingPlan(
            user_id=1,
            week_number=1,
            start_date=today,
            end_date=today + timedelta(days=6),
            motivational_message='Test message'
        )
        db.session.add(plan)
        db.session.commit()
        
        assert plan.id is not None
        assert plan.user_id == 1
        assert plan.week_number == 1

def test_trainer_assignment(app, sample_trainer, sample_plan):
    with app.app_context():
        plan = TrainingPlan.query.get(sample_plan)
        plan.trainer_id = sample_trainer
        db.session.commit()
        
        updated_plan = TrainingPlan.query.get(sample_plan)
        assert updated_plan.trainer_id == sample_trainer
        assert updated_plan.trainer is not None

def test_workout_creation(app, sample_plan):
    with app.app_context():
        workout = Workout(
            training_plan_id=sample_plan,
            day_of_week=2,
            workout_name='Tuesday Legs',
            duration_minutes=45
        )
        db.session.add(workout)
        db.session.commit()
        
        assert workout.id is not None
        assert workout.completed is False

def test_exercise_with_video_metadata(app, sample_workout):
    with app.app_context():
        exercise = Exercise(
            workout_id=sample_workout,
            exercise_name='Squats',
            sets=4,
            reps=12
        )
        db.session.add(exercise)
        db.session.flush()
        
        video = VideoMetadata(
            exercise_id=exercise.id,
            video_url='https://example.com/video.mp4',
            video_title='How to Squat',
            duration_seconds=300
        )
        db.session.add(video)
        db.session.commit()
        
        retrieved_exercise = Exercise.query.get(exercise.id)
        assert retrieved_exercise.video_metadata is not None
        assert retrieved_exercise.video_metadata.video_url == 'https://example.com/video.mp4'

def test_completion_log(app, sample_exercise):
    with app.app_context():
        log = CompletionLog(
            exercise_id=sample_exercise,
            user_id=1,
            sets_completed=3,
            reps_completed=10,
            notes='Felt strong today'
        )
        db.session.add(log)
        db.session.commit()
        
        assert log.id is not None
        assert log.sets_completed == 3

def test_weekly_summary(app, sample_plan):
    with app.app_context():
        summary = WeeklySummary(
            training_plan_id=sample_plan,
            total_workouts=5,
            completed_workouts=4,
            total_exercises=20,
            completion_percentage=80.0,
            trainer_feedback='Great job!'
        )
        db.session.add(summary)
        db.session.commit()
        
        plan = TrainingPlan.query.get(sample_plan)
        assert plan.summary is not None
        assert plan.summary.completion_percentage == 80.0

def test_cascade_deletion(app, sample_plan):
    with app.app_context():
        workout = Workout(
            training_plan_id=sample_plan,
            day_of_week=3,
            workout_name='Wednesday Back'
        )
        db.session.add(workout)
        db.session.commit()
        workout_id = workout.id
        
        plan = TrainingPlan.query.get(sample_plan)
        db.session.delete(plan)
        db.session.commit()
        
        deleted_workout = Workout.query.get(workout_id)
        assert deleted_workout is None
