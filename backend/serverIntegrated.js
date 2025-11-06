require('dotenv').config();
const express = require('express');
const cors = require('cors');
const habitScheduler = require('./scheduler/habitScheduler');
const progressScheduler = require('./scheduler/progressScheduler');
const dashboardRoutes = require('./routes/dashboard');
const dashboardIntegratedRoutes = require('./routes/dashboardIntegrated');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/dashboard', dashboardIntegratedRoutes);
app.use('/api/dashboard/local', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Dashboard Backend API (Integrated)',
    version: '2.0.0',
    integrations: {
      habits: process.env.ENABLE_HABITS_INTEGRATION === 'true',
      training: process.env.ENABLE_TRAINING_INTEGRATION === 'true',
      video: process.env.ENABLE_VIDEO_INTEGRATION === 'true'
    },
    endpoints: {
      dashboard: '/api/dashboard',
      dashboardLocal: '/api/dashboard/local',
      motivation: '/api/dashboard/motivation',
      habits: '/api/dashboard/habits',
      workouts: '/api/dashboard/workouts',
      workoutsPlan: '/api/dashboard/workouts/plan',
      workoutsHistory: '/api/dashboard/workouts/history',
      quickLinks: '/api/dashboard/quick-links',
      progress: '/api/dashboard/progress'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    integrations: {
      habits: {
        enabled: process.env.ENABLE_HABITS_INTEGRATION === 'true',
        url: process.env.HABITS_API_URL || 'http://localhost:3000'
      },
      training: {
        enabled: process.env.ENABLE_TRAINING_INTEGRATION === 'true',
        url: process.env.TRAINING_API_URL || 'http://localhost:5000'
      },
      video: {
        enabled: process.env.ENABLE_VIDEO_INTEGRATION === 'true',
        url: process.env.VIDEO_API_URL || 'http://localhost:4000'
      }
    },
    fallbackMode: process.env.FALLBACK_MODE !== 'false'
  });
});

if (process.env.NODE_ENV !== 'test') {
  habitScheduler.start();
  progressScheduler.start();
}

const server = process.env.NODE_ENV !== 'test' ? app.listen(PORT, () => {
  console.log(`Dashboard Backend API (Integrated) running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
  console.log('\nIntegrations:');
  console.log(`  - Habits API: ${process.env.ENABLE_HABITS_INTEGRATION === 'true' ? 'ENABLED' : 'DISABLED'} (${process.env.HABITS_API_URL || 'http://localhost:3000'})`);
  console.log(`  - Training API: ${process.env.ENABLE_TRAINING_INTEGRATION === 'true' ? 'ENABLED' : 'DISABLED'} (${process.env.TRAINING_API_URL || 'http://localhost:5000'})`);
  console.log(`  - Video API: ${process.env.ENABLE_VIDEO_INTEGRATION === 'true' ? 'ENABLED' : 'DISABLED'} (${process.env.VIDEO_API_URL || 'http://localhost:4000'})`);
  console.log(`  - Fallback Mode: ${process.env.FALLBACK_MODE !== 'false' ? 'ENABLED' : 'DISABLED'}`);
}) : null;

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  habitScheduler.stop();
  progressScheduler.stop();
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
});

module.exports = app;
