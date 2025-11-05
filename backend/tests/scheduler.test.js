const habitScheduler = require('../scheduler/habitScheduler');
const progressScheduler = require('../scheduler/progressScheduler');
const habitService = require('../services/habitService');
const workoutService = require('../services/workoutService');
const fs = require('fs');
const path = require('path');

const habitsDataPath = path.join(__dirname, '../data/habits.json');
const workoutsDataPath = path.join(__dirname, '../data/workouts.json');

describe('Schedulers', () => {
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
    habitScheduler.stop();
    progressScheduler.stop();
  });

  describe('HabitScheduler', () => {
    it('should rollover habits manually', () => {
      const habits = habitService.getHabits();
      habits.forEach(habit => {
        habitService.toggleHabit(habit.id);
      });
      
      const result = habitScheduler.manualRollover();
      
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetDate');
      
      const resetHabits = habitService.getHabits();
      resetHabits.forEach(habit => {
        expect(habit.completed).toBe(false);
      });
    });

    it('should update reset date on rollover', () => {
      habitService.ensureDataFile();
      const result = habitScheduler.manualRollover();
      const today = new Date().toISOString().split('T')[0];
      
      expect(result.resetDate).toBe(today);
    });

    it('should reset all habits to incomplete', () => {
      habitService.ensureDataFile();
      const habits = habitService.getHabits();
      
      habits.forEach(habit => {
        habitService.toggleHabit(habit.id);
      });
      
      habitScheduler.rolloverHabits();
      
      const resetHabits = habitService.getHabits();
      const allIncomplete = resetHabits.every(h => h.completed === false);
      
      expect(allIncomplete).toBe(true);
    });
  });

  describe('ProgressScheduler', () => {
    it('should compute progress manually', () => {
      const result = progressScheduler.manualCompute();
      
      expect(result).toHaveProperty('workouts');
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('computed');
    });

    it('should cache computed progress', () => {
      progressScheduler.computeProgress();
      const cached = progressScheduler.getProgress();
      
      expect(cached).toHaveProperty('workouts');
      expect(cached).toHaveProperty('habits');
      expect(cached).toHaveProperty('computed');
    });

    it('should include workout statistics in progress', () => {
      const result = progressScheduler.computeProgress();
      
      expect(result.workouts).toHaveProperty('totalWorkouts');
      expect(result.workouts).toHaveProperty('totalDuration');
      expect(result.workouts).toHaveProperty('totalCalories');
      expect(result.workouts).toHaveProperty('averageDuration');
      expect(result.workouts).toHaveProperty('breakdown');
    });

    it('should include habit statistics in progress', () => {
      const result = progressScheduler.computeProgress();
      
      expect(result.habits).toHaveProperty('completed');
      expect(result.habits).toHaveProperty('total');
      expect(result.habits).toHaveProperty('percentage');
    });

    it('should have valid computed timestamp', () => {
      const result = progressScheduler.computeProgress();
      const timestamp = new Date(result.computed);
      
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });

    it('should update cache on compute', (done) => {
      const firstResult = progressScheduler.computeProgress();
      
      setTimeout(() => {
        const secondResult = progressScheduler.computeProgress();
        expect(secondResult.computed).not.toBe(firstResult.computed);
        done();
      }, 10);
    });
  });
});
