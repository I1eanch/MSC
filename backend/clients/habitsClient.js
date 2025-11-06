const axios = require('axios');
const config = require('../config/services');

class HabitsClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.habits.baseURL,
      timeout: config.habits.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async getUserHabits(userId, token) {
    try {
      const response = await this.client.get('/habits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching habits from Habits API:', error.message);
      throw error;
    }
  }

  async getHabitStatistics(userId, token) {
    try {
      const response = await this.client.get('/habits/statistics', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching habit statistics:', error.message);
      throw error;
    }
  }

  async getTodayCompletions(userId, token) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await this.client.get(`/habits/completions?date=${today}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching today completions:', error.message);
      throw error;
    }
  }

  async toggleHabitCompletion(habitId, token) {
    try {
      const response = await this.client.post(
        `/habits/${habitId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error toggling habit completion:', error.message);
      throw error;
    }
  }

  isEnabled() {
    return config.habits.enabled;
  }
}

module.exports = new HabitsClient();
