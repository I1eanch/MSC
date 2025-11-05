const request = require('supertest');
const app = require('../server');
const habitService = require('../services/habitService');
const workoutService = require('../services/workoutService');
const fs = require('fs');
const path = require('path');

const habitsDataPath = path.join(__dirname, '../data/habits.json');
const workoutsDataPath = path.join(__dirname, '../data/workouts.json');

describe('Dashboard API', () => {
  beforeAll(() => {
    habitService.ensureDataFile();
    workoutService.ensureDataFile();
  });

  beforeEach(() => {
    habitService.resetHabits();
  });

  afterAll(() => {
    if (fs.existsSync(habitsDataPath)) {
      fs.unlinkSync(habitsDataPath);
    }
    if (fs.existsSync(workoutsDataPath)) {
      fs.unlinkSync(workoutsDataPath);
    }
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api/dashboard', () => {
    it('should return complete dashboard data', async () => {
      const response = await request(app).get('/api/dashboard');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('motivation');
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('workouts');
      expect(response.body.data).toHaveProperty('quickLinks');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return dashboard summary', async () => {
      const response = await request(app).get('/api/dashboard/summary');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('workouts');
    });
  });

  describe('GET /api/dashboard/motivation', () => {
    it('should return daily motivation', async () => {
      const response = await request(app).get('/api/dashboard/motivation');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('quote');
      expect(response.body.data).toHaveProperty('date');
    });
  });

  describe('GET /api/dashboard/habits', () => {
    it('should return habit checklist', async () => {
      const response = await request(app).get('/api/dashboard/habits');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('habits');
      expect(response.body.data).toHaveProperty('summary');
    });
  });

  describe('POST /api/dashboard/habits/:id/toggle', () => {
    it('should toggle habit completion', async () => {
      const response = await request(app).post('/api/dashboard/habits/1/toggle');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('completed');
    });

    it('should return 404 for non-existent habit', async () => {
      const response = await request(app).post('/api/dashboard/habits/9999/toggle');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/dashboard/habits/reset', () => {
    it('should reset all habits', async () => {
      const response = await request(app).post('/api/dashboard/habits/reset');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('resetDate');
    });
  });

  describe('GET /api/dashboard/workouts', () => {
    it('should return weekly workout progress', async () => {
      const response = await request(app).get('/api/dashboard/workouts');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('workoutsByType');
    });
  });

  describe('POST /api/dashboard/workouts', () => {
    it('should add a new workout', async () => {
      const newWorkout = {
        type: 'Running',
        duration: 30,
        calories: 250
      };
      
      const response = await request(app)
        .post('/api/dashboard/workouts')
        .send(newWorkout);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe(newWorkout.type);
    });
  });

  describe('GET /api/dashboard/quick-links', () => {
    it('should return quick links', async () => {
      const response = await request(app).get('/api/dashboard/quick-links');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('links');
      expect(response.body.data).toHaveProperty('total');
    });
  });

  describe('GET /api/dashboard/progress', () => {
    it('should return computed progress', async () => {
      const response = await request(app).get('/api/dashboard/progress');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('workouts');
      expect(response.body.data).toHaveProperty('habits');
    });
  });

  describe('POST /api/dashboard/progress/compute', () => {
    it('should manually compute progress', async () => {
      const response = await request(app).post('/api/dashboard/progress/compute');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('computed');
    });
  });
});
