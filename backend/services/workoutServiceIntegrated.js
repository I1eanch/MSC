const trainingClient = require('../clients/trainingClient');
const workoutServiceLocal = require('./workoutService');
const config = require('../config/services');

class WorkoutServiceIntegrated {
  async getWeeklyProgress(userId) {
    if (trainingClient.isEnabled() && userId) {
      try {
        const progress = await trainingClient.getWeeklyProgress(userId);
        
        return {
          summary: {
            totalWorkouts: progress.totalWorkouts,
            completedWorkouts: progress.completedWorkouts,
            totalExercises: progress.totalExercises,
            completedExercises: progress.completedExercises,
            completionPercentage: progress.completionPercentage,
            totalDuration: 0,
            totalCalories: 0,
            averageDuration: 0,
            averageCalories: 0
          },
          workoutsByType: {},
          recentWorkouts: [],
          weekStart: progress.startDate,
          weekEnd: progress.endDate,
          weekNumber: progress.weekNumber,
          source: 'training-api'
        };
      } catch (error) {
        console.error('Training API unavailable, falling back to local data:', error.message);
        if (config.fallbackMode) {
          return this.getLocalWeeklyProgress();
        }
        throw error;
      }
    }
    
    return this.getLocalWeeklyProgress();
  }

  getLocalWeeklyProgress() {
    const result = workoutServiceLocal.getWeeklyProgress();
    result.source = 'local';
    return result;
  }

  async getCurrentWeekPlan(userId) {
    if (trainingClient.isEnabled() && userId) {
      try {
        const plan = await trainingClient.getCurrentWeekPlan(userId);
        return {
          ...plan,
          source: 'training-api'
        };
      } catch (error) {
        console.error('Training API unavailable:', error.message);
        if (config.fallbackMode) {
          return {
            message: 'No training plan available',
            source: 'local'
          };
        }
        throw error;
      }
    }
    
    return {
      message: 'Training API integration disabled',
      source: 'local'
    };
  }

  async getTrainingHistory(userId, limit = 5) {
    if (trainingClient.isEnabled() && userId) {
      try {
        const history = await trainingClient.getTrainingHistory(userId, limit);
        return {
          history,
          source: 'training-api'
        };
      } catch (error) {
        console.error('Training API unavailable:', error.message);
        if (config.fallbackMode) {
          return {
            history: [],
            source: 'local'
          };
        }
        throw error;
      }
    }
    
    return {
      history: [],
      source: 'local'
    };
  }

  addWorkout(workout) {
    return workoutServiceLocal.addWorkout(workout);
  }

  getAllWorkouts() {
    return workoutServiceLocal.getAllWorkouts();
  }
}

module.exports = new WorkoutServiceIntegrated();
