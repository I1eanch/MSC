from datetime import datetime, timedelta
import random
from app.models import db
from app.models.training import (
    TrainingPlan, Workout, Exercise, CompletionLog, 
    WeeklySummary, Trainer
)

MOTIVATIONAL_MESSAGES = [
    "You're stronger than you think! Push through and conquer this week!",
    "Every workout brings you closer to your goals. Let's make it count!",
    "Believe in yourself and all that you are. This week is your week!",
    "Success is the sum of small efforts repeated day in and day out. Keep going!",
    "Your only limit is you. Break through barriers this week!",
    "The pain you feel today will be the strength you feel tomorrow!",
    "Don't stop when you're tired. Stop when you're done!",
    "Make this week count! Your future self will thank you.",
    "Champions are made when no one is watching. Give it your all!",
    "The harder you work, the luckier you get. Let's do this!"
]

class TrainingService:
    
    @staticmethod
    def assign_trainer_to_plan(plan_id, trainer_id):
        plan = TrainingPlan.query.get(plan_id)
        if not plan:
            raise ValueError(f"Training plan {plan_id} not found")
        
        trainer = Trainer.query.get(trainer_id)
        if not trainer:
            raise ValueError(f"Trainer {trainer_id} not found")
        
        plan.trainer_id = trainer_id
        plan.updated_at = datetime.utcnow()
        db.session.commit()
        
        return plan
    
    @staticmethod
    def generate_weekly_motivational_message(week_number, user_id=None):
        if week_number == 1:
            return "Welcome to your training journey! Let's start strong and build momentum!"
        elif week_number % 4 == 0:
            return f"Week {week_number} - You've made it this far! Keep the consistency going!"
        else:
            return random.choice(MOTIVATIONAL_MESSAGES)
    
    @staticmethod
    def generate_weekly_summary(plan_id):
        plan = TrainingPlan.query.get(plan_id)
        if not plan:
            raise ValueError(f"Training plan {plan_id} not found")
        
        workouts = Workout.query.filter_by(training_plan_id=plan_id).all()
        total_workouts = len(workouts)
        completed_workouts = sum(1 for w in workouts if w.completed)
        
        total_exercises = 0
        total_duration = 0
        
        for workout in workouts:
            exercises = Exercise.query.filter_by(workout_id=workout.id).all()
            total_exercises += len(exercises)
            if workout.duration_minutes:
                total_duration += workout.duration_minutes
        
        completion_percentage = (completed_workouts / total_workouts * 100) if total_workouts > 0 else 0
        
        summary = WeeklySummary.query.filter_by(training_plan_id=plan_id).first()
        if not summary:
            summary = WeeklySummary(training_plan_id=plan_id)
            db.session.add(summary)
        
        summary.total_workouts = total_workouts
        summary.completed_workouts = completed_workouts
        summary.total_exercises = total_exercises
        summary.completion_percentage = round(completion_percentage, 2)
        summary.total_duration_minutes = total_duration
        summary.generated_at = datetime.utcnow()
        
        if completion_percentage >= 90:
            summary.trainer_feedback = "Outstanding work this week! You're crushing your goals!"
        elif completion_percentage >= 70:
            summary.trainer_feedback = "Great effort this week! Keep up the momentum!"
        elif completion_percentage >= 50:
            summary.trainer_feedback = "Good progress! Let's aim for more consistency next week."
        else:
            summary.trainer_feedback = "Let's refocus and make next week stronger. You've got this!"
        
        db.session.commit()
        
        return summary
    
    @staticmethod
    def update_workout_completion(workout_id, completed=True):
        workout = Workout.query.get(workout_id)
        if not workout:
            raise ValueError(f"Workout {workout_id} not found")
        
        workout.completed = completed
        workout.completed_at = datetime.utcnow() if completed else None
        db.session.commit()
        
        return workout
    
    @staticmethod
    def log_exercise_completion(exercise_id, user_id, sets_completed=None, 
                                reps_completed=None, duration_seconds=None, notes=None):
        exercise = Exercise.query.get(exercise_id)
        if not exercise:
            raise ValueError(f"Exercise {exercise_id} not found")
        
        log = CompletionLog(
            exercise_id=exercise_id,
            user_id=user_id,
            sets_completed=sets_completed,
            reps_completed=reps_completed,
            duration_completed_seconds=duration_seconds,
            notes=notes,
            completed_at=datetime.utcnow()
        )
        
        db.session.add(log)
        db.session.commit()
        
        return log
    
    @staticmethod
    def get_user_training_history(user_id, limit=10):
        plans = TrainingPlan.query.filter_by(user_id=user_id)\
            .order_by(TrainingPlan.start_date.desc())\
            .limit(limit)\
            .all()
        
        return plans
    
    @staticmethod
    def get_current_week_plan(user_id):
        today = datetime.utcnow().date()
        plan = TrainingPlan.query.filter(
            TrainingPlan.user_id == user_id,
            TrainingPlan.start_date <= today,
            TrainingPlan.end_date >= today
        ).first()
        
        return plan
    
    @staticmethod
    def create_training_plan(user_id, week_number, start_date, end_date, workouts_data=None):
        motivational_message = TrainingService.generate_weekly_motivational_message(week_number, user_id)
        
        plan = TrainingPlan(
            user_id=user_id,
            week_number=week_number,
            start_date=start_date,
            end_date=end_date,
            motivational_message=motivational_message
        )
        
        db.session.add(plan)
        db.session.flush()
        
        if workouts_data:
            for workout_data in workouts_data:
                workout = Workout(
                    training_plan_id=plan.id,
                    day_of_week=workout_data.get('day_of_week'),
                    workout_name=workout_data.get('workout_name'),
                    description=workout_data.get('description'),
                    duration_minutes=workout_data.get('duration_minutes')
                )
                db.session.add(workout)
                db.session.flush()
                
                exercises_data = workout_data.get('exercises', [])
                for idx, exercise_data in enumerate(exercises_data):
                    exercise = Exercise(
                        workout_id=workout.id,
                        exercise_name=exercise_data.get('exercise_name'),
                        sets=exercise_data.get('sets'),
                        reps=exercise_data.get('reps'),
                        duration_seconds=exercise_data.get('duration_seconds'),
                        notes=exercise_data.get('notes'),
                        order_index=idx
                    )
                    db.session.add(exercise)
        
        db.session.commit()
        
        return plan
