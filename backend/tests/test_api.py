import pytest
import json
from datetime import datetime, timedelta
from app.models import db
from app.models.training import Trainer

def test_create_trainer(client):
    response = client.post('/api/training/trainers', 
        json={
            'name': 'Mike Johnson',
            'email': 'mike@example.com',
            'specialization': 'HIIT'
        }
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['name'] == 'Mike Johnson'
    assert data['email'] == 'mike@example.com'

def test_get_trainers(client, sample_trainer):
    response = client.get('/api/training/trainers')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data) >= 1

def test_get_trainer(client, sample_trainer):
    response = client.get(f'/api/training/trainers/{sample_trainer}')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == sample_trainer

def test_create_plan(client):
    today = datetime.utcnow().date()
    start_date = today
    end_date = today + timedelta(days=6)
    
    response = client.post('/api/training/plans',
        json={
            'user_id': 1,
            'week_number': 1,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'workouts': [
                {
                    'day_of_week': 1,
                    'workout_name': 'Monday Workout',
                    'duration_minutes': 60,
                    'exercises': [
                        {
                            'exercise_name': 'Squats',
                            'sets': 3,
                            'reps': 10
                        }
                    ]
                }
            ]
        }
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['user_id'] == 1
    assert data['week_number'] == 1
    assert len(data['workouts']) == 1

def test_create_plan_missing_fields(client):
    response = client.post('/api/training/plans',
        json={
            'user_id': 1
        }
    )
    
    assert response.status_code == 400

def test_get_plan(client, sample_plan):
    response = client.get(f'/api/training/plans/{sample_plan}')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['id'] == sample_plan

def test_get_plan_not_found(client):
    response = client.get('/api/training/plans/9999')
    
    assert response.status_code == 404

def test_get_current_plan(client, app):
    with app.app_context():
        today = datetime.utcnow().date()
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)
        
        from app.models.training import TrainingPlan
        plan = TrainingPlan(
            user_id=5,
            week_number=1,
            start_date=start_date,
            end_date=end_date,
            motivational_message='Test'
        )
        db.session.add(plan)
        db.session.commit()
    
    response = client.get('/api/training/plans/user/5/current')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['user_id'] == 5

def test_get_current_plan_not_found(client):
    response = client.get('/api/training/plans/user/999/current')
    
    assert response.status_code == 404

def test_get_training_history(client, sample_plan):
    response = client.get('/api/training/plans/user/1/history')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'plans' in data
    assert len(data['plans']) >= 1

def test_get_training_history_with_limit(client, app):
    with app.app_context():
        today = datetime.utcnow().date()
        
        from app.models.training import TrainingPlan
        for i in range(5):
            start_date = today - timedelta(weeks=i)
            end_date = start_date + timedelta(days=6)
            
            plan = TrainingPlan(
                user_id=10,
                week_number=i+1,
                start_date=start_date,
                end_date=end_date,
                motivational_message='Test'
            )
            db.session.add(plan)
        db.session.commit()
    
    response = client.get('/api/training/plans/user/10/history?limit=3')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['plans']) == 3

def test_assign_trainer(client, sample_plan, sample_trainer):
    response = client.put(f'/api/training/plans/{sample_plan}/assign-trainer',
        json={'trainer_id': sample_trainer}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['trainer_id'] == sample_trainer

def test_assign_trainer_missing_trainer_id(client, sample_plan):
    response = client.put(f'/api/training/plans/{sample_plan}/assign-trainer',
        json={}
    )
    
    assert response.status_code == 400

def test_assign_trainer_invalid_plan(client, sample_trainer):
    response = client.put('/api/training/plans/9999/assign-trainer',
        json={'trainer_id': sample_trainer}
    )
    
    assert response.status_code == 404

def test_get_summary(client, sample_plan, sample_workout):
    response = client.get(f'/api/training/plans/{sample_plan}/summary')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'total_workouts' in data
    assert 'completion_percentage' in data

def test_complete_workout(client, sample_workout):
    response = client.put(f'/api/training/workouts/{sample_workout}/complete',
        json={'completed': True}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['completed'] is True
    assert data['completed_at'] is not None

def test_uncomplete_workout(client, sample_workout):
    client.put(f'/api/training/workouts/{sample_workout}/complete',
        json={'completed': True}
    )
    
    response = client.put(f'/api/training/workouts/{sample_workout}/complete',
        json={'completed': False}
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['completed'] is False
    assert data['completed_at'] is None

def test_log_exercise(client, sample_exercise):
    response = client.post(f'/api/training/exercises/{sample_exercise}/log',
        json={
            'user_id': 1,
            'sets_completed': 3,
            'reps_completed': 12,
            'notes': 'Felt good'
        }
    )
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['sets_completed'] == 3
    assert data['reps_completed'] == 12

def test_log_exercise_missing_user_id(client, sample_exercise):
    response = client.post(f'/api/training/exercises/{sample_exercise}/log',
        json={
            'sets_completed': 3
        }
    )
    
    assert response.status_code == 400

def test_get_exercise_history(client, sample_exercise, app):
    with app.app_context():
        from app.models.training import CompletionLog
        for i in range(3):
            log = CompletionLog(
                exercise_id=sample_exercise,
                user_id=1,
                sets_completed=3,
                reps_completed=10+i
            )
            db.session.add(log)
        db.session.commit()
    
    response = client.get(f'/api/training/exercises/{sample_exercise}/history')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'logs' in data
    assert len(data['logs']) == 3
