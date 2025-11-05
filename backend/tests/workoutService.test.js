const workoutService = require('../services/workoutService');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/workouts.json');

describe('WorkoutService', () => {
  beforeEach(() => {
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
    workoutService.ensureDataFile();
  });

  afterAll(() => {
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
  });

  describe('getWeeklyProgress', () => {
    it('should return weekly progress summary', () => {
      const result = workoutService.getWeeklyProgress();
      
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('workoutsByType');
      expect(result).toHaveProperty('recentWorkouts');
      expect(result).toHaveProperty('weekStart');
      expect(result).toHaveProperty('weekEnd');
    });

    it('should have correct summary structure', () => {
      const result = workoutService.getWeeklyProgress();
      
      expect(result.summary).toHaveProperty('totalWorkouts');
      expect(result.summary).toHaveProperty('totalDuration');
      expect(result.summary).toHaveProperty('totalCalories');
      expect(result.summary).toHaveProperty('averageDuration');
      expect(result.summary).toHaveProperty('averageCalories');
    });

    it('should calculate totals correctly', () => {
      const result = workoutService.getWeeklyProgress();
      
      expect(typeof result.summary.totalWorkouts).toBe('number');
      expect(typeof result.summary.totalDuration).toBe('number');
      expect(typeof result.summary.totalCalories).toBe('number');
      expect(result.summary.totalWorkouts).toBeGreaterThanOrEqual(0);
    });

    it('should group workouts by type', () => {
      const result = workoutService.getWeeklyProgress();
      
      Object.values(result.workoutsByType).forEach(typeData => {
        expect(typeData).toHaveProperty('count');
        expect(typeData).toHaveProperty('duration');
        expect(typeData).toHaveProperty('calories');
      });
    });

    it('should include recent workouts', () => {
      const result = workoutService.getWeeklyProgress();
      
      expect(Array.isArray(result.recentWorkouts)).toBe(true);
      expect(result.recentWorkouts.length).toBeLessThanOrEqual(5);
    });

    it('should have valid date range', () => {
      const result = workoutService.getWeeklyProgress();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(result.weekStart).toMatch(dateRegex);
      expect(result.weekEnd).toMatch(dateRegex);
      expect(new Date(result.weekStart) <= new Date(result.weekEnd)).toBe(true);
    });
  });

  describe('addWorkout', () => {
    it('should add a new workout', () => {
      const newWorkout = {
        type: 'Running',
        duration: 30,
        calories: 250
      };
      
      const result = workoutService.addWorkout(newWorkout);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('date');
      expect(result.type).toBe(newWorkout.type);
      expect(result.duration).toBe(newWorkout.duration);
      expect(result.calories).toBe(newWorkout.calories);
    });

    it('should assign unique id', () => {
      const workout1 = workoutService.addWorkout({ type: 'A', duration: 10, calories: 100 });
      const workout2 = workoutService.addWorkout({ type: 'B', duration: 20, calories: 200 });
      
      expect(workout1.id).not.toBe(workout2.id);
    });

    it('should use current date if not provided', () => {
      const result = workoutService.addWorkout({ type: 'Test', duration: 10, calories: 100 });
      const today = new Date().toISOString().split('T')[0];
      
      expect(result.date).toBe(today);
    });

    it('should mark as completed by default', () => {
      const result = workoutService.addWorkout({ type: 'Test', duration: 10, calories: 100 });
      
      expect(result.completed).toBe(true);
    });
  });

  describe('getAllWorkouts', () => {
    it('should return all workouts', () => {
      const result = workoutService.getAllWorkouts();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have valid workout structure', () => {
      const result = workoutService.getAllWorkouts();
      
      result.forEach(workout => {
        expect(workout).toHaveProperty('id');
        expect(workout).toHaveProperty('date');
        expect(workout).toHaveProperty('type');
        expect(workout).toHaveProperty('duration');
        expect(workout).toHaveProperty('calories');
        expect(workout).toHaveProperty('completed');
      });
    });
  });
});
