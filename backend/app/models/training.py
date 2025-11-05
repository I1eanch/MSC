from datetime import datetime
from . import db

class Trainer(db.Model):
    __tablename__ = 'trainers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    specialization = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    training_plans = db.relationship('TrainingPlan', backref='trainer', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'specialization': self.specialization,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class TrainingPlan(db.Model):
    __tablename__ = 'training_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    trainer_id = db.Column(db.Integer, db.ForeignKey('trainers.id'), nullable=True)
    week_number = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    motivational_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    workouts = db.relationship('Workout', backref='training_plan', lazy=True, cascade='all, delete-orphan')
    summary = db.relationship('WeeklySummary', backref='training_plan', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self, include_workouts=False):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'trainer_id': self.trainer_id,
            'trainer': self.trainer.to_dict() if self.trainer else None,
            'week_number': self.week_number,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'motivational_message': self.motivational_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_workouts:
            result['workouts'] = [workout.to_dict(include_exercises=True) for workout in self.workouts]
            result['summary'] = self.summary.to_dict() if self.summary else None
        
        return result


class Workout(db.Model):
    __tablename__ = 'workouts'
    
    id = db.Column(db.Integer, primary_key=True)
    training_plan_id = db.Column(db.Integer, db.ForeignKey('training_plans.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)
    workout_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    duration_minutes = db.Column(db.Integer)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    exercises = db.relationship('Exercise', backref='workout', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_exercises=False):
        result = {
            'id': self.id,
            'training_plan_id': self.training_plan_id,
            'day_of_week': self.day_of_week,
            'workout_name': self.workout_name,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'completed': self.completed,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_exercises:
            result['exercises'] = [exercise.to_dict() for exercise in self.exercises]
        
        return result


class Exercise(db.Model):
    __tablename__ = 'exercises'
    
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workouts.id'), nullable=False)
    exercise_name = db.Column(db.String(200), nullable=False)
    sets = db.Column(db.Integer)
    reps = db.Column(db.Integer)
    duration_seconds = db.Column(db.Integer)
    notes = db.Column(db.Text)
    order_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    video_metadata = db.relationship('VideoMetadata', backref='exercise', uselist=False, cascade='all, delete-orphan')
    completion_logs = db.relationship('CompletionLog', backref='exercise', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'workout_id': self.workout_id,
            'exercise_name': self.exercise_name,
            'sets': self.sets,
            'reps': self.reps,
            'duration_seconds': self.duration_seconds,
            'notes': self.notes,
            'order_index': self.order_index,
            'video_metadata': self.video_metadata.to_dict() if self.video_metadata else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class VideoMetadata(db.Model):
    __tablename__ = 'video_metadata'
    
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False, unique=True)
    video_url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500))
    duration_seconds = db.Column(db.Integer)
    video_title = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exercise_id': self.exercise_id,
            'video_url': self.video_url,
            'thumbnail_url': self.thumbnail_url,
            'duration_seconds': self.duration_seconds,
            'video_title': self.video_title,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CompletionLog(db.Model):
    __tablename__ = 'completion_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercises.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    sets_completed = db.Column(db.Integer)
    reps_completed = db.Column(db.Integer)
    duration_completed_seconds = db.Column(db.Integer)
    notes = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'exercise_id': self.exercise_id,
            'user_id': self.user_id,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'sets_completed': self.sets_completed,
            'reps_completed': self.reps_completed,
            'duration_completed_seconds': self.duration_completed_seconds,
            'notes': self.notes
        }


class WeeklySummary(db.Model):
    __tablename__ = 'weekly_summaries'
    
    id = db.Column(db.Integer, primary_key=True)
    training_plan_id = db.Column(db.Integer, db.ForeignKey('training_plans.id'), nullable=False, unique=True)
    total_workouts = db.Column(db.Integer, default=0)
    completed_workouts = db.Column(db.Integer, default=0)
    total_exercises = db.Column(db.Integer, default=0)
    completion_percentage = db.Column(db.Float, default=0.0)
    total_duration_minutes = db.Column(db.Integer, default=0)
    trainer_feedback = db.Column(db.Text)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'training_plan_id': self.training_plan_id,
            'total_workouts': self.total_workouts,
            'completed_workouts': self.completed_workouts,
            'total_exercises': self.total_exercises,
            'completion_percentage': self.completion_percentage,
            'total_duration_minutes': self.total_duration_minutes,
            'trainer_feedback': self.trainer_feedback,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None
        }
