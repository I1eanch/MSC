const cron = require('node-cron');
const workoutService = require('../services/workoutService');
const habitService = require('../services/habitService');

class ProgressScheduler {
  constructor() {
    this.task = null;
    this.weeklyProgressCache = null;
    this.lastComputed = null;
  }

  start() {
    this.task = cron.schedule('0 */6 * * *', () => {
      console.log('Computing progress every 6 hours...');
      this.computeProgress();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    this.computeProgress();
    
    console.log('Progress scheduler started - will compute progress every 6 hours');
  }

  computeProgress() {
    try {
      const workoutProgress = workoutService.getWeeklyProgress();
      const habitStats = habitService.getHabitStats();
      
      this.weeklyProgressCache = {
        workouts: {
          totalWorkouts: workoutProgress.summary.totalWorkouts,
          totalDuration: workoutProgress.summary.totalDuration,
          totalCalories: workoutProgress.summary.totalCalories,
          averageDuration: workoutProgress.summary.averageDuration,
          breakdown: workoutProgress.workoutsByType
        },
        habits: {
          completed: habitStats.completed,
          total: habitStats.total,
          percentage: habitStats.percentage
        },
        computed: new Date().toISOString()
      };
      
      this.lastComputed = new Date();
      
      console.log(`Progress computed at ${this.lastComputed.toISOString()}`);
      console.log(`- Workouts this week: ${workoutProgress.summary.totalWorkouts}`);
      console.log(`- Habits completed: ${habitStats.completed}/${habitStats.total} (${habitStats.percentage}%)`);
      
      return this.weeklyProgressCache;
    } catch (error) {
      console.error('Error computing progress:', error);
      throw error;
    }
  }

  getProgress() {
    if (!this.weeklyProgressCache) {
      return this.computeProgress();
    }
    return this.weeklyProgressCache;
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('Progress scheduler stopped');
    }
  }

  manualCompute() {
    console.log('Manual progress computation triggered');
    return this.computeProgress();
  }
}

module.exports = new ProgressScheduler();
