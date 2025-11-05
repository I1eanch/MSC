import pytest
from datetime import datetime, timedelta
from app import create_app
from app.models import db
from app.models.training import Trainer, TrainingPlan, Workout, Exercise

@pytest.fixture
def app():
    config = {
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'TESTING': True,
        'SECRET_KEY': 'test-secret-key'
    }
    
    app = create_app(config)
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def sample_trainer(app):
    with app.app_context():
        trainer = Trainer(
            name='John Doe',
            email='john@example.com',
            specialization='Strength Training'
        )
        db.session.add(trainer)
        db.session.commit()
        return trainer.id

@pytest.fixture
def sample_plan(app):
    with app.app_context():
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        plan = TrainingPlan(
            user_id=1,
            week_number=1,
            start_date=start_date,
            end_date=end_date,
            motivational_message='Test message'
        )
        db.session.add(plan)
        db.session.commit()
        return plan.id

@pytest.fixture
def sample_workout(app, sample_plan):
    with app.app_context():
        workout = Workout(
            training_plan_id=sample_plan,
            day_of_week=1,
            workout_name='Monday Chest Day',
            description='Chest and triceps',
            duration_minutes=60
        )
        db.session.add(workout)
        db.session.commit()
        return workout.id

@pytest.fixture
def sample_exercise(app, sample_workout):
    with app.app_context():
        exercise = Exercise(
            workout_id=sample_workout,
            exercise_name='Bench Press',
            sets=3,
            reps=10,
            notes='Focus on form'
        )
        db.session.add(exercise)
        db.session.commit()
        return exercise.id
