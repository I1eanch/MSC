const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const motivationalService = require('../services/motivationalService');
const habitService = require('../services/habitService');
const workoutService = require('../services/workoutService');
const quickLinksService = require('../services/quickLinksService');
const habitScheduler = require('../scheduler/habitScheduler');
const progressScheduler = require('../scheduler/progressScheduler');

router.get('/', (req, res) => {
  try {
    const dashboardData = dashboardService.getDashboardData();
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/summary', (req, res) => {
  try {
    const summary = dashboardService.getDashboardSummary();
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/motivation', (req, res) => {
  try {
    const motivation = motivationalService.getDailyMotivation();
    res.json({
      success: true,
      data: motivation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/habits', (req, res) => {
  try {
    const habits = habitService.getHabitChecklist();
    res.json({
      success: true,
      data: habits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/habits/:id/toggle', (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const habit = habitService.toggleHabit(habitId);
    
    if (habit) {
      res.json({
        success: true,
        data: habit
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Habit not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/habits/reset', (req, res) => {
  try {
    const result = habitScheduler.manualRollover();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/workouts', (req, res) => {
  try {
    const workouts = workoutService.getWeeklyProgress();
    res.json({
      success: true,
      data: workouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/workouts', (req, res) => {
  try {
    const workout = workoutService.addWorkout(req.body);
    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/quick-links', (req, res) => {
  try {
    const quickLinks = quickLinksService.getQuickLinks();
    res.json({
      success: true,
      data: quickLinks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/progress', (req, res) => {
  try {
    const progress = progressScheduler.getProgress();
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/progress/compute', (req, res) => {
  try {
    const progress = progressScheduler.manualCompute();
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
