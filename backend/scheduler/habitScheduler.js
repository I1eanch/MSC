const cron = require('node-cron');
const habitService = require('../services/habitService');

class HabitScheduler {
  constructor() {
    this.task = null;
  }

  start() {
    this.task = cron.schedule('0 0 * * *', () => {
      console.log('Running daily habit reset at midnight...');
      this.rolloverHabits();
    }, {
      scheduled: true,
      timezone: "UTC"
    });

    console.log('Habit scheduler started - will reset habits daily at midnight UTC');
  }

  rolloverHabits() {
    try {
      const result = habitService.resetHabits();
      console.log(`Habits rolled over successfully on ${result.resetDate}`);
      return result;
    } catch (error) {
      console.error('Error rolling over habits:', error);
      throw error;
    }
  }

  stop() {
    if (this.task) {
      this.task.stop();
      console.log('Habit scheduler stopped');
    }
  }

  manualRollover() {
    console.log('Manual habit rollover triggered');
    return this.rolloverHabits();
  }
}

module.exports = new HabitScheduler();
