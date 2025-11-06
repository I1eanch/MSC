const axios = require('axios');
const config = require('../config/services');

class TrainingClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.training.baseURL,
      timeout: config.training.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getCurrentWeekPlan(userId) {
    try {
      const response = await this.client.get(`/api/training/plans/user/${userId}/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current week plan:', error.message);
      throw error;
    }
  }

  async getWeeklyProgress(userId) {
    try {
      const response = await this.client.get(`/api/training/plans/user/${userId}/current`);
      const plan = response.data;
      
      if (!plan) {
        return {
          totalWorkouts: 0,
          completedWorkouts: 0,
          totalExercises: 0,
          completedExercises: 0,
          completionPercentage: 0,
          weekNumber: 0
        };
      }

      const totalWorkouts = plan.workouts ? plan.workouts.length : 0;
      const completedWorkouts = plan.workouts 
        ? plan.workouts.filter(w => w.completed).length 
        : 0;
      
      let totalExercises = 0;
      let completedExercises = 0;
      
      if (plan.workouts) {
        plan.workouts.forEach(workout => {
          if (workout.exercises) {
            totalExercises += workout.exercises.length;
            completedExercises += workout.exercises.filter(e => e.completed).length;
          }
        });
      }

      return {
        totalWorkouts,
        completedWorkouts,
        totalExercises,
        completedExercises,
        completionPercentage: totalWorkouts > 0 
          ? Math.round((completedWorkouts / totalWorkouts) * 100) 
          : 0,
        weekNumber: plan.week_number || 0,
        startDate: plan.start_date,
        endDate: plan.end_date
      };
    } catch (error) {
      console.error('Error fetching weekly progress:', error.message);
      throw error;
    }
  }

  async getTrainingHistory(userId, limit = 5) {
    try {
      const response = await this.client.get(`/api/training/plans/user/${userId}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching training history:', error.message);
      throw error;
    }
  }

  async getWeeklySummary(planId) {
    try {
      const response = await this.client.get(`/api/training/plans/${planId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly summary:', error.message);
      throw error;
    }
  }

  async completeWorkout(workoutId) {
    try {
      const response = await this.client.post(`/api/training/workouts/${workoutId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing workout:', error.message);
      throw error;
    }
  }

  isEnabled() {
    return config.training.enabled;
  }
}

module.exports = new TrainingClient();
