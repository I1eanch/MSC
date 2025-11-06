const habitsClient = require('../clients/habitsClient');
const habitServiceLocal = require('./habitService');
const config = require('../config/services');

class HabitServiceIntegrated {
  async getHabitChecklist(userId, token) {
    if (habitsClient.isEnabled() && userId && token) {
      try {
        const habits = await habitsClient.getUserHabits(userId, token);
        const completions = await habitsClient.getTodayCompletions(userId, token);
        
        const completionMap = new Map();
        completions.forEach(c => completionMap.set(c.habitId, true));
        
        const enrichedHabits = habits.map(habit => ({
          id: habit.id,
          name: habit.name,
          description: habit.description || '',
          frequency: habit.frequency || 'daily',
          completed: completionMap.has(habit.id),
          streak: habit.currentStreak || 0
        }));

        const totalHabits = enrichedHabits.length;
        const completedHabits = enrichedHabits.filter(h => h.completed).length;

        return {
          habits: enrichedHabits,
          summary: {
            total: totalHabits,
            completed: completedHabits,
            percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
          },
          lastReset: new Date().toISOString().split('T')[0],
          source: 'habits-api'
        };
      } catch (error) {
        console.error('Habits API unavailable, falling back to local data:', error.message);
        if (config.fallbackMode) {
          return this.getLocalHabitChecklist();
        }
        throw error;
      }
    }
    
    return this.getLocalHabitChecklist();
  }

  getLocalHabitChecklist() {
    const result = habitServiceLocal.getHabitChecklist();
    result.source = 'local';
    return result;
  }

  async toggleHabit(habitId, userId, token) {
    if (habitsClient.isEnabled() && userId && token) {
      try {
        const result = await habitsClient.toggleHabitCompletion(habitId, token);
        return {
          ...result,
          source: 'habits-api'
        };
      } catch (error) {
        console.error('Habits API unavailable, falling back to local data:', error.message);
        if (config.fallbackMode) {
          return this.toggleLocalHabit(habitId);
        }
        throw error;
      }
    }
    
    return this.toggleLocalHabit(habitId);
  }

  toggleLocalHabit(habitId) {
    const result = habitServiceLocal.toggleHabit(habitId);
    if (result) {
      result.source = 'local';
    }
    return result;
  }

  async getHabitStats(userId, token) {
    if (habitsClient.isEnabled() && userId && token) {
      try {
        const stats = await habitsClient.getHabitStatistics(userId, token);
        return {
          completed: stats.completedToday || 0,
          total: stats.totalHabits || 0,
          percentage: stats.completionRate || 0,
          lastReset: new Date().toISOString().split('T')[0],
          totalCompletions: stats.totalCompletions || 0,
          averageStreak: stats.averageStreak || 0,
          source: 'habits-api'
        };
      } catch (error) {
        console.error('Habits API unavailable, falling back to local data:', error.message);
        if (config.fallbackMode) {
          return this.getLocalHabitStats();
        }
        throw error;
      }
    }
    
    return this.getLocalHabitStats();
  }

  getLocalHabitStats() {
    const result = habitServiceLocal.getHabitStats();
    result.source = 'local';
    return result;
  }

  resetHabits() {
    return habitServiceLocal.resetHabits();
  }

  getHabits() {
    return habitServiceLocal.getHabits();
  }
}

module.exports = new HabitServiceIntegrated();
