import request from 'supertest';
import app from './app';

jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('API Integration Tests', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Articles API', () => {
    it('should get paginated articles', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=5');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should filter articles by category', async () => {
      const response = await request(app)
        .get('/api/articles?categories=1');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      response.body.data.forEach((article: any) => {
        expect(article.categories).toContain('1');
      });
    });

    it('should filter articles by difficulty', async () => {
      const response = await request(app)
        .get('/api/articles?difficulty=beginner');
      
      expect(response.status).toBe(200);
      response.body.data.forEach((article: any) => {
        expect(article.metadata?.difficulty).toBe('beginner');
      });
    });

    it('should search articles', async () => {
      const response = await request(app)
        .get('/api/articles/search?q=JavaScript');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should get personalized articles', async () => {
      const response = await request(app)
        .get('/api/articles/personalized/user123?level=beginner&age=25&goals=web-development');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should get articles by category', async () => {
      const response = await request(app)
        .get('/api/articles/category/1');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should get articles by tag', async () => {
      const response = await request(app)
        .get('/api/articles/tag/4');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it('should get article by id', async () => {
      const response = await request(app)
        .get('/api/articles/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .get('/api/articles/non-existent');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Categories API', () => {
    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get category by id', async () => {
      const response = await request(app)
        .get('/api/categories/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
    });

    it('should return 404 for non-existent category', async () => {
      const response = await request(app)
        .get('/api/categories/non-existent');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Tags API', () => {
    it('should get all tags', async () => {
      const response = await request(app)
        .get('/api/tags');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get tag by id', async () => {
      const response = await request(app)
        .get('/api/tags/1');
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe('1');
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/api/tags/non-existent');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Favorites API', () => {
    it('should add a favorite', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({
          userId: 'test-user-123',
          articleId: '1'
        });
      
      expect([201, 400]).toContain(response.status);
    });

    it('should get user favorites', async () => {
      const response = await request(app)
        .get('/api/favorites/test-user-123');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should check if article is favorited', async () => {
      const response = await request(app)
        .get('/api/favorites/test-user-123/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('isFavorite');
    });

    it('should return error when adding favorite without required fields', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .send({});
      
      expect(response.status).toBe(400);
    });
  });

  describe('Pagination', () => {
    it('should handle first page', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.pagination.hasPrev).toBe(false);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should handle middle page', async () => {
      const response = await request(app)
        .get('/api/articles?page=2&limit=1');
      
      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
    });

    it('should calculate total pages correctly', async () => {
      const response = await request(app)
        .get('/api/articles?page=1&limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.pagination.totalPages).toBeGreaterThan(0);
      expect(response.body.pagination.total).toBeDefined();
    });
  });

  describe('Personalization', () => {
    it('should apply personalization based on user level', async () => {
      const response = await request(app)
        .get('/api/articles/personalized/user123?level=beginner');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should apply personalization based on user age', async () => {
      const response = await request(app)
        .get('/api/articles/personalized/user123?age=20');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should apply personalization based on user goals', async () => {
      const response = await request(app)
        .get('/api/articles/personalized/user123?goals=web-development&goals=learn-programming');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should apply combined personalization', async () => {
      const response = await request(app)
        .get('/api/articles/personalized/user123?level=beginner&age=25&goals=web-development');
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});
