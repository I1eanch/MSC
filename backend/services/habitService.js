const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/habits.json');

class HabitService {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(dataPath)) {
      const initialData = {
        habits: [
          { id: 1, name: "Morning Exercise", description: "30 minutes of cardio", frequency: "daily", completed: false },
          { id: 2, name: "Drink Water", description: "8 glasses of water", frequency: "daily", completed: false },
          { id: 3, name: "Read", description: "Read for 20 minutes", frequency: "daily", completed: false },
          { id: 4, name: "Meditation", description: "10 minutes of mindfulness", frequency: "daily", completed: false },
          { id: 5, name: "Healthy Meal", description: "Prepare a nutritious meal", frequency: "daily", completed: false }
        ],
        lastReset: new Date().toISOString().split('T')[0]
      };
      fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
    }
  }

  getHabits() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return data.habits;
  }

  getHabitChecklist() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const totalHabits = data.habits.length;
    const completedHabits = data.habits.filter(h => h.completed).length;
    
    return {
      habits: data.habits,
      summary: {
        total: totalHabits,
        completed: completedHabits,
        percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
      },
      lastReset: data.lastReset
    };
  }

  toggleHabit(habitId) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const habit = data.habits.find(h => h.id === habitId);
    
    if (habit) {
      habit.completed = !habit.completed;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return habit;
    }
    
    return null;
  }

  resetHabits() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data.habits.forEach(habit => {
      habit.completed = false;
    });
    data.lastReset = new Date().toISOString().split('T')[0];
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    return {
      message: 'Habits reset successfully',
      resetDate: data.lastReset
    };
  }

  getHabitStats() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const completed = data.habits.filter(h => h.completed).length;
    const total = data.habits.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      lastReset: data.lastReset
    };
  }
}

module.exports = new HabitService();
