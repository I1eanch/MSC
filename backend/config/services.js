module.exports = {
  habits: {
    baseURL: process.env.HABITS_API_URL || 'http://localhost:3000',
    timeout: 5000,
    enabled: process.env.ENABLE_HABITS_INTEGRATION === 'true'
  },
  training: {
    baseURL: process.env.TRAINING_API_URL || 'http://localhost:5000',
    timeout: 5000,
    enabled: process.env.ENABLE_TRAINING_INTEGRATION === 'true'
  },
  video: {
    baseURL: process.env.VIDEO_API_URL || 'http://localhost:4000',
    timeout: 5000,
    enabled: process.env.ENABLE_VIDEO_INTEGRATION === 'true'
  },
  fallbackMode: process.env.FALLBACK_MODE !== 'false'
};
