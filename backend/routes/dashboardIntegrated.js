const express = require('express');
const router = express.Router();
const dashboardServiceIntegrated = require('../services/dashboardServiceIntegrated');
const motivationalService = require('../services/motivationalService');
const habitServiceIntegrated = require('../services/habitServiceIntegrated');
const workoutServiceIntegrated = require('../services/workoutServiceIntegrated');
const quickLinksService = require('../services/quickLinksService');
const habitScheduler = require('../scheduler/habitScheduler');
const progressScheduler = require('../scheduler/progressScheduler');

function extractUserContext(req) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  const token = req.headers.authorization?.replace('Bearer ', '');
  return { userId, token };
}

router.get('/', async (req, res) => {
  try {
    const { userId, token } = extractUserContext(req);
    const dashboardData = await dashboardServiceIntegrated.getDashboardData(userId, token);
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

router.get('/summary', async (req, res) => {
  try {
    const { userId, token } = extractUserContext(req);
    const summary = await dashboardServiceIntegrated.getDashboardSummary(userId, token);
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

router.get('/habits', async (req, res) => {
  try {
    const { userId, token } = extractUserContext(req);
    const habits = await habitServiceIntegrated.getHabitChecklist(userId, token);
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

router.post('/habits/:id/toggle', async (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    const { userId, token } = extractUserContext(req);
    const habit = await habitServiceIntegrated.toggleHabit(habitId, userId, token);
    
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

router.get('/workouts', async (req, res) => {
  try {
    const { userId } = extractUserContext(req);
    const workouts = await workoutServiceIntegrated.getWeeklyProgress(userId);
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

router.get('/workouts/plan', async (req, res) => {
  try {
    const { userId } = extractUserContext(req);
    const plan = await workoutServiceIntegrated.getCurrentWeekPlan(userId);
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/workouts/history', async (req, res) => {
  try {
    const { userId } = extractUserContext(req);
    const limit = parseInt(req.query.limit) || 5;
    const history = await workoutServiceIntegrated.getTrainingHistory(userId, limit);
    res.json({
      success: true,
      data: history
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
    const workout = workoutServiceIntegrated.addWorkout(req.body);
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
