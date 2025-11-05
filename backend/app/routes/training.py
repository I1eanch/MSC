from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.models import db
from app.models.training import TrainingPlan, Workout, Exercise, Trainer, CompletionLog
from app.services import TrainingService

training_bp = Blueprint('training', __name__, url_prefix='/api/training')

@training_bp.route('/plans', methods=['POST'])
def create_plan():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    user_id = data.get('user_id')
    week_number = data.get('week_number')
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    
    if not all([user_id, week_number, start_date_str, end_date_str]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        start_date = datetime.fromisoformat(start_date_str).date()
        end_date = datetime.fromisoformat(end_date_str).date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    workouts_data = data.get('workouts', [])
    
    try:
        plan = TrainingService.create_training_plan(
            user_id=user_id,
            week_number=week_number,
            start_date=start_date,
            end_date=end_date,
            workouts_data=workouts_data
        )
        
        return jsonify(plan.to_dict(include_workouts=True)), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@training_bp.route('/plans/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    plan = TrainingPlan.query.get(plan_id)
    
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    return jsonify(plan.to_dict(include_workouts=True)), 200


@training_bp.route('/plans/user/<int:user_id>/current', methods=['GET'])
def get_current_plan(user_id):
    plan = TrainingService.get_current_week_plan(user_id)
    
    if not plan:
        return jsonify({'error': 'No active plan found for this week'}), 404
    
    return jsonify(plan.to_dict(include_workouts=True)), 200


@training_bp.route('/plans/user/<int:user_id>/history', methods=['GET'])
def get_training_history(user_id):
    limit = request.args.get('limit', 10, type=int)
    
    plans = TrainingService.get_user_training_history(user_id, limit=limit)
    
    return jsonify({
        'user_id': user_id,
        'plans': [plan.to_dict() for plan in plans]
    }), 200


@training_bp.route('/plans/<int:plan_id>/assign-trainer', methods=['PUT'])
def assign_trainer(plan_id):
    data = request.get_json()
    
    if not data or 'trainer_id' not in data:
        return jsonify({'error': 'trainer_id is required'}), 400
    
    trainer_id = data.get('trainer_id')
    
    try:
        plan = TrainingService.assign_trainer_to_plan(plan_id, trainer_id)
        return jsonify(plan.to_dict()), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@training_bp.route('/plans/<int:plan_id>/summary', methods=['GET'])
def get_summary(plan_id):
    try:
        summary = TrainingService.generate_weekly_summary(plan_id)
        return jsonify(summary.to_dict()), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@training_bp.route('/workouts/<int:workout_id>/complete', methods=['PUT'])
def complete_workout(workout_id):
    data = request.get_json() or {}
    completed = data.get('completed', True)
    
    try:
        workout = TrainingService.update_workout_completion(workout_id, completed)
        return jsonify(workout.to_dict()), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@training_bp.route('/exercises/<int:exercise_id>/log', methods=['POST'])
def log_exercise(exercise_id):
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        return jsonify({'error': 'user_id is required'}), 400
    
    user_id = data.get('user_id')
    sets_completed = data.get('sets_completed')
    reps_completed = data.get('reps_completed')
    duration_seconds = data.get('duration_seconds')
    notes = data.get('notes')
    
    try:
        log = TrainingService.log_exercise_completion(
            exercise_id=exercise_id,
            user_id=user_id,
            sets_completed=sets_completed,
            reps_completed=reps_completed,
            duration_seconds=duration_seconds,
            notes=notes
        )
        
        return jsonify(log.to_dict()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@training_bp.route('/exercises/<int:exercise_id>/history', methods=['GET'])
def get_exercise_history(exercise_id):
    limit = request.args.get('limit', 10, type=int)
    
    logs = CompletionLog.query.filter_by(exercise_id=exercise_id)\
        .order_by(CompletionLog.completed_at.desc())\
        .limit(limit)\
        .all()
    
    return jsonify({
        'exercise_id': exercise_id,
        'logs': [log.to_dict() for log in logs]
    }), 200


@training_bp.route('/trainers', methods=['POST'])
def create_trainer():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    name = data.get('name')
    email = data.get('email')
    
    if not all([name, email]):
        return jsonify({'error': 'name and email are required'}), 400
    
    specialization = data.get('specialization')
    
    trainer = Trainer(
        name=name,
        email=email,
        specialization=specialization
    )
    
    try:
        db.session.add(trainer)
        db.session.commit()
        return jsonify(trainer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@training_bp.route('/trainers', methods=['GET'])
def get_trainers():
    trainers = Trainer.query.all()
    return jsonify([trainer.to_dict() for trainer in trainers]), 200


@training_bp.route('/trainers/<int:trainer_id>', methods=['GET'])
def get_trainer(trainer_id):
    trainer = Trainer.query.get(trainer_id)
    
    if not trainer:
        return jsonify({'error': 'Trainer not found'}), 404
    
    return jsonify(trainer.to_dict()), 200
