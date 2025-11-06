require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const videoRoutes = require('./src/routes/videoRoutes');
const authRoutes = require('./src/routes/authRoutes');
const { initDatabase } = require('./src/database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.use(errorHandler);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Video Infrastructure Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    logger.error('Failed to initialize database:', err);
    process.exit(1);
  });

module.exports = app;
