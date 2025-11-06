const request = require('supertest');
const app = require('../serverIntegrated');
const habitServiceIntegrated = require('../services/habitServiceIntegrated');
const workoutServiceIntegrated = require('../services/workoutServiceIntegrated');

describe('Dashboard API Integration Tests', () => {
  describe('GET /api/dashboard', () => {
    it('should return complete dashboard data with integration info', async () => {
      const response = await request(app).get('/api/dashboard');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('motivation');
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('workouts');
      expect(response.body.data).toHaveProperty('quickLinks');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('integrations');
    });

    it('should include source information for habits and workouts', async () => {
      const response = await request(app).get('/api/dashboard');
      
      expect(response.body.data.habits).toHaveProperty('source');
      expect(response.body.data.workouts).toHaveProperty('source');
    });
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return dashboard summary with integration info', async () => {
      const response = await request(app).get('/api/dashboard/summary');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('workouts');
      expect(response.body.data).toHaveProperty('integrations');
    });
  });

  describe('GET /api/dashboard/habits', () => {
    it('should return habits with source information', async () => {
      const response = await request(app).get('/api/dashboard/habits');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('source');
    });
  });

  describe('GET /api/dashboard/workouts', () => {
    it('should return workouts with source information', async () => {
      const response = await request(app).get('/api/dashboard/workouts');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('source');
    });
  });

  describe('GET /api/dashboard/workouts/plan', () => {
    it('should return current week training plan', async () => {
      const response = await request(app)
        .get('/api/dashboard/workouts/plan')
        .set('x-user-id', '1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('source');
    });
  });

  describe('GET /api/dashboard/workouts/history', () => {
    it('should return training history', async () => {
      const response = await request(app)
        .get('/api/dashboard/workouts/history')
        .set('x-user-id', '1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('source');
    });

    it('should accept limit parameter', async () => {
      const response = await request(app)
        .get('/api/dashboard/workouts/history?limit=3')
        .set('x-user-id', '1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /health', () => {
    it('should return health status with integration info', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('integrations');
      expect(response.body.integrations).toHaveProperty('habits');
      expect(response.body.integrations).toHaveProperty('training');
      expect(response.body.integrations).toHaveProperty('video');
      expect(response.body).toHaveProperty('fallbackMode');
    });
  });

  describe('Fallback behavior', () => {
    it('should use local data when external services are unavailable', async () => {
      const response = await request(app).get('/api/dashboard/habits');
      
      expect(response.status).toBe(200);
      expect(response.body.data.source).toBe('local');
    });
  });

  describe('User context extraction', () => {
    it('should accept user ID from headers', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('x-user-id', '123');
      
      expect(response.status).toBe(200);
    });

    it('should accept user ID from query parameters', async () => {
      const response = await request(app)
        .get('/api/dashboard?userId=123');
      
      expect(response.status).toBe(200);
    });

    it('should accept authorization token', async () => {
      const response = await request(app)
        .get('/api/dashboard')
        .set('Authorization', 'Bearer test-token')
        .set('x-user-id', '123');
      
      expect(response.status).toBe(200);
    });
  });
});
