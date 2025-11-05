const dashboardService = require('../services/dashboardService');
const habitService = require('../services/habitService');
const workoutService = require('../services/workoutService');
const fs = require('fs');
const path = require('path');

const habitsDataPath = path.join(__dirname, '../data/habits.json');
const workoutsDataPath = path.join(__dirname, '../data/workouts.json');

describe('DashboardService', () => {
  beforeAll(() => {
    habitService.ensureDataFile();
    workoutService.ensureDataFile();
  });

  beforeEach(() => {
    habitService.resetHabits();
  });

  afterAll(() => {
    if (fs.existsSync(habitsDataPath)) {
      fs.unlinkSync(habitsDataPath);
    }
    if (fs.existsSync(workoutsDataPath)) {
      fs.unlinkSync(workoutsDataPath);
    }
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard data', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('motivation');
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('quickLinks');
      expect(result).toHaveProperty('summary');
    });

    it('should include motivation data', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.motivation).toHaveProperty('daily');
      expect(result.motivation.daily).toHaveProperty('quote');
      expect(result.motivation.daily).toHaveProperty('date');
    });

    it('should include habits data with checklist and summary', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.habits).toHaveProperty('checklist');
      expect(result.habits).toHaveProperty('summary');
      expect(result.habits).toHaveProperty('lastReset');
      expect(Array.isArray(result.habits.checklist)).toBe(true);
      expect(result.habits.summary).toHaveProperty('total');
      expect(result.habits.summary).toHaveProperty('completed');
      expect(result.habits.summary).toHaveProperty('percentage');
    });

    it('should include workouts data with weekly progress', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.workouts).toHaveProperty('weeklyProgress');
      expect(result.workouts).toHaveProperty('breakdown');
      expect(result.workouts).toHaveProperty('recentWorkouts');
      expect(result.workouts).toHaveProperty('period');
      expect(result.workouts.period).toHaveProperty('start');
      expect(result.workouts.period).toHaveProperty('end');
    });

    it('should include quick links data', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.quickLinks).toHaveProperty('links');
      expect(result.quickLinks).toHaveProperty('categories');
      expect(Array.isArray(result.quickLinks.links)).toBe(true);
      expect(Array.isArray(result.quickLinks.categories)).toBe(true);
    });

    it('should include summary data', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.summary).toHaveProperty('habitsCompleted');
      expect(result.summary).toHaveProperty('habitsTotal');
      expect(result.summary).toHaveProperty('habitsPercentage');
      expect(result.summary).toHaveProperty('weeklyWorkouts');
      expect(result.summary).toHaveProperty('weeklyCalories');
      expect(typeof result.summary.habitsCompleted).toBe('number');
      expect(typeof result.summary.habitsTotal).toBe('number');
      expect(typeof result.summary.habitsPercentage).toBe('number');
      expect(typeof result.summary.weeklyWorkouts).toBe('number');
      expect(typeof result.summary.weeklyCalories).toBe('number');
    });

    it('should have valid timestamp', () => {
      const result = dashboardService.getDashboardData();
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should aggregate data correctly', () => {
      const result = dashboardService.getDashboardData();
      
      expect(result.summary.habitsCompleted).toBe(result.habits.summary.completed);
      expect(result.summary.habitsTotal).toBe(result.habits.summary.total);
      expect(result.summary.habitsPercentage).toBe(result.habits.summary.percentage);
      expect(result.summary.weeklyWorkouts).toBe(result.workouts.weeklyProgress.totalWorkouts);
      expect(result.summary.weeklyCalories).toBe(result.workouts.weeklyProgress.totalCalories);
    });
  });

  describe('getDashboardSummary', () => {
    it('should return dashboard summary', () => {
      const result = dashboardService.getDashboardSummary();
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('workouts');
    });

    it('should include habits summary', () => {
      const result = dashboardService.getDashboardSummary();
      
      expect(result.habits).toHaveProperty('completed');
      expect(result.habits).toHaveProperty('total');
      expect(result.habits).toHaveProperty('percentage');
    });

    it('should include workouts summary', () => {
      const result = dashboardService.getDashboardSummary();
      
      expect(result.workouts).toHaveProperty('weeklyCount');
      expect(result.workouts).toHaveProperty('totalDuration');
      expect(result.workouts).toHaveProperty('totalCalories');
    });

    it('should have valid timestamp', () => {
      const result = dashboardService.getDashboardSummary();
      const timestamp = new Date(result.timestamp);
      
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });
});
