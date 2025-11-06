const express = require('express');
const cors = require('cors');
const habitScheduler = require('./scheduler/habitScheduler');
const progressScheduler = require('./scheduler/progressScheduler');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Dashboard Backend API',
    version: '1.0.0',
    endpoints: {
      dashboard: '/api/dashboard',
      motivation: '/api/dashboard/motivation',
      habits: '/api/dashboard/habits',
      workouts: '/api/dashboard/workouts',
      quickLinks: '/api/dashboard/quick-links',
      progress: '/api/dashboard/progress'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  habitScheduler.start();
  progressScheduler.start();
}

const server = process.env.NODE_ENV !== 'test' ? app.listen(PORT, () => {
  console.log(`Dashboard Backend API running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
}) : null;

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  habitScheduler.stop();
  progressScheduler.stop();
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
