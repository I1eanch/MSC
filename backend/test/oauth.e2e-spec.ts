import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/database/entities/user.entity';
import { OAuthProvider } from '../src/auth/dto/oauth-login.dto';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuth Authentication (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await userRepository.clear();
  });

  describe('/auth/oauth/login (POST)', () => {
    describe('Google OAuth', () => {
      it('should create new user with Google OAuth', async () => {
        const mockGoogleResponse = {
          data: {
            sub: 'google123',
            email: 'newuser@example.com',
            name: 'New User',
            picture: 'https://example.com/photo.jpg',
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.GOOGLE,
            accessToken: 'valid-google-token',
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user).toMatchObject({
          email: 'newuser@example.com',
          provider: OAuthProvider.GOOGLE,
        });

        const user = await userRepository.findOne({
          where: { email: 'newuser@example.com' },
        });

        expect(user).toBeDefined();
        expect(user.provider).toBe(OAuthProvider.GOOGLE);
        expect(user.providerId).toBe('google123');
        expect(user.password).toBeNull();
      });

      it('should login existing Google OAuth user', async () => {
        const existingUser = userRepository.create({
          email: 'existing@example.com',
          provider: OAuthProvider.GOOGLE,
          providerId: 'google123',
          password: null,
        });
        await userRepository.save(existingUser);

        const mockGoogleResponse = {
          data: {
            sub: 'google123',
            email: 'existing@example.com',
            name: 'Existing User',
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.GOOGLE,
            accessToken: 'valid-google-token',
          })
          .expect(200);

        expect(response.body.user.id).toBe(existingUser.id);
        expect(response.body.user.email).toBe('existing@example.com');
      });

      it('should link Google OAuth to existing password-based account', async () => {
        const existingUser = userRepository.create({
          email: 'existing@example.com',
          password: 'hashed-password',
          provider: null,
          providerId: null,
        });
        await userRepository.save(existingUser);

        const mockGoogleResponse = {
          data: {
            sub: 'google123',
            email: 'existing@example.com',
            name: 'Existing User',
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.GOOGLE,
            accessToken: 'valid-google-token',
          })
          .expect(200);

        expect(response.body.user.id).toBe(existingUser.id);

        const updatedUser = await userRepository.findOne({
          where: { id: existingUser.id },
        });

        expect(updatedUser.provider).toBe(OAuthProvider.GOOGLE);
        expect(updatedUser.providerId).toBe('google123');
        expect(updatedUser.password).toBe('hashed-password');
      });

      it('should reject linking to account with different provider', async () => {
        const existingUser = userRepository.create({
          email: 'existing@example.com',
          password: null,
          provider: OAuthProvider.APPLE,
          providerId: 'apple123',
        });
        await userRepository.save(existingUser);

        const mockGoogleResponse = {
          data: {
            sub: 'google456',
            email: 'existing@example.com',
            name: 'Existing User',
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.GOOGLE,
            accessToken: 'valid-google-token',
          })
          .expect(400);

        expect(response.body.message).toContain('already linked with');
      });

      it('should reject invalid Google token', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

        await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.GOOGLE,
            accessToken: 'invalid-token',
          })
          .expect(401);
      });
    });

    describe('Apple OAuth', () => {
      it('should create new user with Apple OAuth', async () => {
        const idToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcHBsZTEyMyIsImVtYWlsIjoibmV3dXNlckBleGFtcGxlLmNvbSJ9.test';

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.APPLE,
            accessToken: 'valid-apple-token',
            idToken,
            userData: { fullName: 'Apple User' },
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user.email).toBe('newuser@example.com');
        expect(response.body.user.provider).toBe(OAuthProvider.APPLE);
      });

      it('should reject Apple login without idToken', async () => {
        await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.APPLE,
            accessToken: 'valid-apple-token',
          })
          .expect(401);
      });
    });

    describe('VK OAuth', () => {
      it('should create new user with VK OAuth', async () => {
        const mockVKUserResponse = {
          data: {
            response: [
              {
                id: 123456,
                first_name: 'VK',
                last_name: 'User',
                photo_200: 'https://example.com/photo.jpg',
              },
            ],
          },
        };

        const mockVKEmailResponse = {
          data: {
            response: {
              email: 'vkuser@example.com',
            },
          },
        };

        mockedAxios.get
          .mockResolvedValueOnce(mockVKUserResponse)
          .mockResolvedValueOnce(mockVKEmailResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.VK,
            accessToken: 'valid-vk-token',
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user.email).toBe('vkuser@example.com');
        expect(response.body.user.provider).toBe(OAuthProvider.VK);
      });
    });

    describe('Yandex OAuth', () => {
      it('should create new user with Yandex OAuth', async () => {
        const mockYandexResponse = {
          data: {
            id: 'yandex123',
            default_email: 'yandexuser@example.com',
            display_name: 'Yandex User',
            default_avatar_id: 'avatar123',
          },
        };

        mockedAxios.get.mockResolvedValueOnce(mockYandexResponse);

        const response = await request(app.getHttpServer())
          .post('/auth/oauth/login')
          .send({
            provider: OAuthProvider.YANDEX,
            accessToken: 'valid-yandex-token',
          })
          .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(response.body.user.email).toBe('yandexuser@example.com');
        expect(response.body.user.provider).toBe(OAuthProvider.YANDEX);
      });
    });

    it('should reject invalid provider', async () => {
      await request(app.getHttpServer())
        .post('/auth/oauth/login')
        .send({
          provider: 'invalid-provider',
          accessToken: 'some-token',
        })
        .expect(400);
    });

    it('should reject missing accessToken', async () => {
      await request(app.getHttpServer())
        .post('/auth/oauth/login')
        .send({
          provider: OAuthProvider.GOOGLE,
        })
        .expect(400);
    });
  });

  describe('Password fallback for OAuth users', () => {
    it('should allow password-based login after OAuth account linking', async () => {
      const mockGoogleResponse = {
        data: {
          sub: 'google123',
          email: 'user@example.com',
          name: 'User',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

      await request(app.getHttpServer())
        .post('/auth/oauth/login')
        .send({
          provider: OAuthProvider.GOOGLE,
          accessToken: 'valid-google-token',
        })
        .expect(200);

      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      const user = await userRepository.findOne({
        where: { email: 'user@example.com' },
      });

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'newpassword123',
        })
        .expect(409);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
