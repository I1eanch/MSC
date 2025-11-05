import pytest
from datetime import datetime, timedelta
from app.models import db
from app.models.training import TrainingPlan, Workout, Exercise, WeeklySummary
from app.services import TrainingService

def test_assign_trainer_to_plan(app, sample_plan, sample_trainer):
    with app.app_context():
        plan = TrainingService.assign_trainer_to_plan(sample_plan, sample_trainer)
        
        assert plan.trainer_id == sample_trainer
        assert plan.trainer is not None

def test_assign_trainer_invalid_plan(app, sample_trainer):
    with app.app_context():
        with pytest.raises(ValueError, match='Training plan .* not found'):
            TrainingService.assign_trainer_to_plan(9999, sample_trainer)

def test_assign_trainer_invalid_trainer(app, sample_plan):
    with app.app_context():
        with pytest.raises(ValueError, match='Trainer .* not found'):
            TrainingService.assign_trainer_to_plan(sample_plan, 9999)

def test_generate_weekly_motivational_message():
    message_week_1 = TrainingService.generate_weekly_motivational_message(1)
    assert 'Welcome' in message_week_1
    
    message_week_4 = TrainingService.generate_weekly_motivational_message(4)
    assert 'Week 4' in message_week_4
    
    message_week_2 = TrainingService.generate_weekly_motivational_message(2)
    assert len(message_week_2) > 0

def test_generate_weekly_summary(app, sample_plan, sample_workout):
    with app.app_context():
        workout = Workout.query.get(sample_workout)
        workout.completed = True
        workout.duration_minutes = 60
        db.session.commit()
        
        exercise = Exercise(
            workout_id=sample_workout,
            exercise_name='Push-ups',
            sets=3,
            reps=15
        )
        db.session.add(exercise)
        db.session.commit()
        
        summary = TrainingService.generate_weekly_summary(sample_plan)
        
        assert summary is not None
        assert summary.total_workouts == 1
        assert summary.completed_workouts == 1
        assert summary.completion_percentage == 100.0
        assert summary.total_exercises == 1
        assert 'Outstanding' in summary.trainer_feedback

def test_generate_weekly_summary_partial_completion(app, sample_plan):
    with app.app_context():
        for i in range(5):
            workout = Workout(
                training_plan_id=sample_plan,
                day_of_week=i+1,
                workout_name=f'Day {i+1}',
                duration_minutes=45
            )
            if i < 2:
                workout.completed = True
            db.session.add(workout)
        db.session.commit()
        
        summary = TrainingService.generate_weekly_summary(sample_plan)
        
        assert summary.total_workouts == 5
        assert summary.completed_workouts == 2
        assert summary.completion_percentage == 40.0
        assert 'refocus' in summary.trainer_feedback.lower()

def test_update_workout_completion(app, sample_workout):
    with app.app_context():
        workout = TrainingService.update_workout_completion(sample_workout, True)
        
        assert workout.completed is True
        assert workout.completed_at is not None

def test_update_workout_completion_mark_incomplete(app, sample_workout):
    with app.app_context():
        TrainingService.update_workout_completion(sample_workout, True)
        workout = TrainingService.update_workout_completion(sample_workout, False)
        
        assert workout.completed is False
        assert workout.completed_at is None

def test_log_exercise_completion(app, sample_exercise):
    with app.app_context():
        log = TrainingService.log_exercise_completion(
            exercise_id=sample_exercise,
            user_id=1,
            sets_completed=3,
            reps_completed=12,
            notes='Good form'
        )
        
        assert log is not None
        assert log.sets_completed == 3
        assert log.reps_completed == 12

def test_get_user_training_history(app):
    with app.app_context():
        today = datetime.utcnow().date()
        
        for i in range(3):
            start_date = today - timedelta(weeks=i, days=today.weekday())
            end_date = start_date + timedelta(days=6)
            
            plan = TrainingPlan(
                user_id=1,
                week_number=i+1,
                start_date=start_date,
                end_date=end_date,
                motivational_message='Test'
            )
            db.session.add(plan)
        db.session.commit()
        
        history = TrainingService.get_user_training_history(1, limit=10)
        
        assert len(history) == 3
        assert history[0].start_date >= history[1].start_date

def test_get_current_week_plan(app):
    with app.app_context():
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        plan = TrainingPlan(
            user_id=1,
            week_number=5,
            start_date=start_date,
            end_date=end_date,
            motivational_message='Current week'
        )
        db.session.add(plan)
        db.session.commit()
        
        current_plan = TrainingService.get_current_week_plan(1)
        
        assert current_plan is not None
        assert current_plan.week_number == 5

def test_create_training_plan(app):
    with app.app_context():
        today = datetime.utcnow().date()
        start_date = today
        end_date = today + timedelta(days=6)
        
        workouts_data = [
            {
                'day_of_week': 1,
                'workout_name': 'Monday Push',
                'description': 'Chest and triceps',
                'duration_minutes': 60,
                'exercises': [
                    {
                        'exercise_name': 'Bench Press',
                        'sets': 3,
                        'reps': 10
                    },
                    {
                        'exercise_name': 'Tricep Dips',
                        'sets': 3,
                        'reps': 12
                    }
                ]
            },
            {
                'day_of_week': 3,
                'workout_name': 'Wednesday Pull',
                'description': 'Back and biceps',
                'duration_minutes': 55,
                'exercises': [
                    {
                        'exercise_name': 'Pull-ups',
                        'sets': 3,
                        'reps': 8
                    }
                ]
            }
        ]
        
        plan = TrainingService.create_training_plan(
            user_id=2,
            week_number=1,
            start_date=start_date,
            end_date=end_date,
            workouts_data=workouts_data
        )
        
        assert plan is not None
        assert plan.user_id == 2
        assert len(plan.workouts) == 2
        
        monday_workout = next(w for w in plan.workouts if w.day_of_week == 1)
        assert len(monday_workout.exercises) == 2
        assert monday_workout.exercises[0].order_index == 0

def test_plan_progression(app):
    with app.app_context():
        today = datetime.utcnow().date()
        
        for week in range(1, 5):
            start_date = today + timedelta(weeks=week-1)
            end_date = start_date + timedelta(days=6)
            
            plan = TrainingService.create_training_plan(
                user_id=1,
                week_number=week,
                start_date=start_date,
                end_date=end_date,
                workouts_data=[
                    {
                        'day_of_week': 1,
                        'workout_name': f'Week {week} - Day 1',
                        'duration_minutes': 45
                    }
                ]
            )
            
            assert plan.week_number == week
            
            if week == 4:
                assert f'Week {week}' in plan.motivational_message
            elif week == 1:
                assert 'Welcome' in plan.motivational_message
        
        history = TrainingService.get_user_training_history(1, limit=10)
        assert len(history) == 4
        
        week_numbers = [p.week_number for p in history]
        assert 4 in week_numbers
        assert 1 in week_numbers
