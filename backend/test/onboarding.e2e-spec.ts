import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { Goal } from '../src/database/entities/goal.entity';
import { ActivityLevel } from '../src/database/entities/activity-level.entity';
import { UserOnboarding } from '../src/database/entities/user-onboarding.entity';

describe('Onboarding (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let goalRepository: Repository<Goal>;
  let activityLevelRepository: Repository<ActivityLevel>;
  let onboardingRepository: Repository<UserOnboarding>;
  let authToken: string;
  let testUser: User;
  let testGoal: Goal;
  let testActivityLevel: ActivityLevel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
    goalRepository = moduleFixture.get(getRepositoryToken(Goal));
    activityLevelRepository = moduleFixture.get(getRepositoryToken(ActivityLevel));
    onboardingRepository = moduleFixture.get(getRepositoryToken(UserOnboarding));
  });

  afterAll(async () => {
    if (testUser) {
      await onboardingRepository.delete({ userId: testUser.id });
      await userRepository.delete(testUser.id);
    }
    await app.close();
  });

  describe('GET /onboarding/goals', () => {
    it('should return list of goals', async () => {
      testGoal = await goalRepository.save({
        name: 'Test Goal ' + Date.now(),
        description: 'Test goal description',
        displayOrder: 99,
      });

      const response = await request(app.getHttpServer())
        .get('/onboarding/goals')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('GET /onboarding/activity-levels', () => {
    it('should return list of activity levels', async () => {
      testActivityLevel = await activityLevelRepository.save({
        name: 'Test Level ' + Date.now(),
        description: 'Test activity level',
        displayOrder: 99,
      });

      const response = await request(app.getHttpServer())
        .get('/onboarding/activity-levels')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
    });
  });

  describe('POST /onboarding/profile', () => {
    beforeAll(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-onboarding-${Date.now()}@example.com`,
          password: 'Test123!@#',
        })
        .expect(201);

      authToken = registerResponse.body.accessToken;
      const userId = registerResponse.body.user.id;
      testUser = await userRepository.findOne({ where: { id: userId } });
    });

    it('should create onboarding profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          age: 30,
          gender: 'male',
          height: 180,
          weight: 75,
          activityLevelId: testActivityLevel.id,
          healthConstraints: 'None',
          goalIds: [testGoal.id],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.age).toBe(30);
      expect(response.body.gender).toBe('male');
      expect(response.body.height).toBe('180.00');
      expect(response.body.weight).toBe('75.00');
      expect(response.body.completionPercentage).toBe(100);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/onboarding/profile')
        .send({
          age: 30,
        })
        .expect(401);
    });
  });

  describe('GET /onboarding/profile', () => {
    it('should get user onboarding profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('age');
      expect(response.body).toHaveProperty('completionPercentage');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/onboarding/profile')
        .expect(401);
    });
  });

  describe('PATCH /onboarding/profile', () => {
    it('should update onboarding profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/onboarding/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          age: 31,
          weight: 76,
        })
        .expect(200);

      expect(response.body.age).toBe(31);
      expect(response.body.weight).toBe('76.00');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/onboarding/profile')
        .send({
          age: 31,
        })
        .expect(401);
    });
  });
});
