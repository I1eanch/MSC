import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      })
      .expect(201);

    expect(response.body.access_token).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should login with valid credentials', async () => {
    // First register a user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
      });

    // Then login
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(response.body.access_token).toBeDefined();
    authToken = response.body.access_token;
  });

  it('should reject invalid credentials', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });
});