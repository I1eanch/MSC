const motivationalService = require('./motivationalService');
const habitService = require('./habitService');
const workoutService = require('./workoutService');
const quickLinksService = require('./quickLinksService');

class DashboardService {
  getDashboardData() {
    const motivation = motivationalService.getDailyMotivation();
    const habits = habitService.getHabitChecklist();
    const workoutProgress = workoutService.getWeeklyProgress();
    const quickLinks = quickLinksService.getQuickLinks();

    return {
      timestamp: new Date().toISOString(),
      motivation: {
        daily: motivation
      },
      habits: {
        checklist: habits.habits,
        summary: habits.summary,
        lastReset: habits.lastReset
      },
      workouts: {
        weeklyProgress: workoutProgress.summary,
        breakdown: workoutProgress.workoutsByType,
        recentWorkouts: workoutProgress.recentWorkouts,
        period: {
          start: workoutProgress.weekStart,
          end: workoutProgress.weekEnd
        }
      },
      quickLinks: {
        links: quickLinks.links,
        categories: quickLinksService.getCategories()
      },
      summary: {
        habitsCompleted: habits.summary.completed,
        habitsTotal: habits.summary.total,
        habitsPercentage: habits.summary.percentage,
        weeklyWorkouts: workoutProgress.summary.totalWorkouts,
        weeklyCalories: workoutProgress.summary.totalCalories
      }
    };
  }

  getDashboardSummary() {
    const habits = habitService.getHabitStats();
    const workoutProgress = workoutService.getWeeklyProgress();

    return {
      timestamp: new Date().toISOString(),
      habits: {
        completed: habits.completed,
        total: habits.total,
        percentage: habits.percentage
      },
      workouts: {
        weeklyCount: workoutProgress.summary.totalWorkouts,
        totalDuration: workoutProgress.summary.totalDuration,
        totalCalories: workoutProgress.summary.totalCalories
      }
    };
  }
}

module.exports = new DashboardService();
