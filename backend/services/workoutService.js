const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/workouts.json');

class WorkoutService {
  constructor() {
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(dataPath)) {
      const initialData = {
        workouts: [
          { id: 1, date: this.getDateOffset(0), type: "Cardio", duration: 30, calories: 250, completed: true },
          { id: 2, date: this.getDateOffset(-1), type: "Strength", duration: 45, calories: 200, completed: true },
          { id: 3, date: this.getDateOffset(-2), type: "Yoga", duration: 60, calories: 150, completed: true },
          { id: 4, date: this.getDateOffset(-3), type: "Running", duration: 40, calories: 300, completed: true },
          { id: 5, date: this.getDateOffset(-4), type: "Cycling", duration: 50, calories: 350, completed: true },
          { id: 6, date: this.getDateOffset(-5), type: "Swimming", duration: 45, calories: 280, completed: true }
        ]
      };
      fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
    }
  }

  getDateOffset(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  getWeeklyProgress() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyWorkouts = data.workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekAgo && workoutDate <= today;
    });

    const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = weeklyWorkouts.reduce((sum, w) => sum + w.calories, 0);
    const workoutsByType = {};
    
    weeklyWorkouts.forEach(workout => {
      if (!workoutsByType[workout.type]) {
        workoutsByType[workout.type] = { count: 0, duration: 0, calories: 0 };
      }
      workoutsByType[workout.type].count++;
      workoutsByType[workout.type].duration += workout.duration;
      workoutsByType[workout.type].calories += workout.calories;
    });

    return {
      summary: {
        totalWorkouts: weeklyWorkouts.length,
        totalDuration,
        totalCalories,
        averageDuration: weeklyWorkouts.length > 0 ? Math.round(totalDuration / weeklyWorkouts.length) : 0,
        averageCalories: weeklyWorkouts.length > 0 ? Math.round(totalCalories / weeklyWorkouts.length) : 0
      },
      workoutsByType,
      recentWorkouts: weeklyWorkouts.slice(-5).reverse(),
      weekStart: weekAgo.toISOString().split('T')[0],
      weekEnd: today.toISOString().split('T')[0]
    };
  }

  addWorkout(workout) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const newWorkout = {
      id: data.workouts.length > 0 ? Math.max(...data.workouts.map(w => w.id)) + 1 : 1,
      date: workout.date || new Date().toISOString().split('T')[0],
      type: workout.type,
      duration: workout.duration,
      calories: workout.calories,
      completed: workout.completed !== undefined ? workout.completed : true
    };
    
    data.workouts.push(newWorkout);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    
    return newWorkout;
  }

  getAllWorkouts() {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return data.workouts;
  }
}

module.exports = new WorkoutService();
