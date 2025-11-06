const motivationalService = require('./motivationalService');
const habitServiceIntegrated = require('./habitServiceIntegrated');
const workoutServiceIntegrated = require('./workoutServiceIntegrated');
const quickLinksService = require('./quickLinksService');

class DashboardServiceIntegrated {
  async getDashboardData(userId, token) {
    const motivation = motivationalService.getDailyMotivation();
    const habits = await habitServiceIntegrated.getHabitChecklist(userId, token);
    const workoutProgress = await workoutServiceIntegrated.getWeeklyProgress(userId);
    const quickLinks = quickLinksService.getQuickLinks();

    return {
      timestamp: new Date().toISOString(),
      motivation: {
        daily: motivation
      },
      habits: {
        checklist: habits.habits,
        summary: habits.summary,
        lastReset: habits.lastReset,
        source: habits.source
      },
      workouts: {
        weeklyProgress: workoutProgress.summary,
        breakdown: workoutProgress.workoutsByType,
        recentWorkouts: workoutProgress.recentWorkouts,
        period: {
          start: workoutProgress.weekStart,
          end: workoutProgress.weekEnd
        },
        weekNumber: workoutProgress.weekNumber,
        source: workoutProgress.source
      },
      quickLinks: {
        links: quickLinks.links,
        categories: quickLinksService.getCategories()
      },
      summary: {
        habitsCompleted: habits.summary.completed,
        habitsTotal: habits.summary.total,
        habitsPercentage: habits.summary.percentage,
        weeklyWorkouts: workoutProgress.summary.totalWorkouts || workoutProgress.summary.completedWorkouts || 0,
        weeklyCalories: workoutProgress.summary.totalCalories || 0
      },
      integrations: {
        habits: habits.source,
        workouts: workoutProgress.source
      }
    };
  }

  async getDashboardSummary(userId, token) {
    const habits = await habitServiceIntegrated.getHabitStats(userId, token);
    const workoutProgress = await workoutServiceIntegrated.getWeeklyProgress(userId);

    return {
      timestamp: new Date().toISOString(),
      habits: {
        completed: habits.completed,
        total: habits.total,
        percentage: habits.percentage,
        source: habits.source
      },
      workouts: {
        weeklyCount: workoutProgress.summary.totalWorkouts || workoutProgress.summary.completedWorkouts || 0,
        totalDuration: workoutProgress.summary.totalDuration || 0,
        totalCalories: workoutProgress.summary.totalCalories || 0,
        source: workoutProgress.source
      },
      integrations: {
        habits: habits.source,
        workouts: workoutProgress.source
      }
    };
  }
}

module.exports = new DashboardServiceIntegrated();
