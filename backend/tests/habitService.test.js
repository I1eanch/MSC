const habitService = require('../services/habitService');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/habits.json');

describe('HabitService', () => {
  beforeEach(() => {
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
    habitService.ensureDataFile();
  });

  afterAll(() => {
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }
  });

  describe('getHabits', () => {
    it('should return an array of habits', () => {
      const habits = habitService.getHabits();
      
      expect(Array.isArray(habits)).toBe(true);
      expect(habits.length).toBeGreaterThan(0);
    });

    it('should return habits with correct structure', () => {
      const habits = habitService.getHabits();
      
      habits.forEach(habit => {
        expect(habit).toHaveProperty('id');
        expect(habit).toHaveProperty('name');
        expect(habit).toHaveProperty('description');
        expect(habit).toHaveProperty('frequency');
        expect(habit).toHaveProperty('completed');
      });
    });
  });

  describe('getHabitChecklist', () => {
    it('should return checklist with habits and summary', () => {
      const result = habitService.getHabitChecklist();
      
      expect(result).toHaveProperty('habits');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('lastReset');
      expect(Array.isArray(result.habits)).toBe(true);
    });

    it('should calculate summary correctly', () => {
      const result = habitService.getHabitChecklist();
      
      expect(result.summary).toHaveProperty('total');
      expect(result.summary).toHaveProperty('completed');
      expect(result.summary).toHaveProperty('percentage');
      expect(typeof result.summary.total).toBe('number');
      expect(typeof result.summary.completed).toBe('number');
      expect(typeof result.summary.percentage).toBe('number');
    });

    it('should have percentage between 0 and 100', () => {
      const result = habitService.getHabitChecklist();
      
      expect(result.summary.percentage).toBeGreaterThanOrEqual(0);
      expect(result.summary.percentage).toBeLessThanOrEqual(100);
    });
  });

  describe('toggleHabit', () => {
    it('should toggle habit completion status', () => {
      const habits = habitService.getHabits();
      const habitId = habits[0].id;
      const initialStatus = habits[0].completed;
      
      const result = habitService.toggleHabit(habitId);
      
      expect(result.completed).toBe(!initialStatus);
    });

    it('should return null for non-existent habit', () => {
      const result = habitService.toggleHabit(9999);
      
      expect(result).toBeNull();
    });

    it('should persist the change', () => {
      const habits = habitService.getHabits();
      const habitId = habits[0].id;
      
      habitService.toggleHabit(habitId);
      const updatedHabits = habitService.getHabits();
      const updatedHabit = updatedHabits.find(h => h.id === habitId);
      
      expect(updatedHabit.completed).toBe(!habits[0].completed);
    });
  });

  describe('resetHabits', () => {
    it('should reset all habits to incomplete', () => {
      const habits = habitService.getHabits();
      habits.forEach(habit => {
        habitService.toggleHabit(habit.id);
      });
      
      habitService.resetHabits();
      const resetHabits = habitService.getHabits();
      
      resetHabits.forEach(habit => {
        expect(habit.completed).toBe(false);
      });
    });

    it('should update lastReset date', () => {
      const result = habitService.resetHabits();
      
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetDate');
      expect(result.resetDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getHabitStats', () => {
    it('should return habit statistics', () => {
      const stats = habitService.getHabitStats();
      
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('percentage');
      expect(stats).toHaveProperty('lastReset');
    });

    it('should calculate percentage correctly', () => {
      habitService.resetHabits();
      const habits = habitService.getHabits();
      
      habitService.toggleHabit(habits[0].id);
      const stats = habitService.getHabitStats();
      
      expect(stats.completed).toBe(1);
      expect(stats.total).toBe(habits.length);
      expect(stats.percentage).toBe(Math.round((1 / habits.length) * 100));
    });
  });
});
