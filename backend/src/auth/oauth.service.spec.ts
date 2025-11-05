import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { UsersService } from '../users/users.service';
import { User } from '../database/entities/user.entity';
import { OAuthProvider } from './dto/oauth-login.dto';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuthService', () => {
  let service: OAuthService;
  let userRepository: Repository<User>;
  let usersService: UsersService;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    password: null,
    role: 0,
    provider: OAuthProvider.GOOGLE,
    providerId: 'google123',
    providerData: {},
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {};

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<OAuthService>(OAuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateGoogleToken', () => {
    it('should validate Google token successfully', async () => {
      const mockGoogleResponse = {
        data: {
          sub: 'google123',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockGoogleResponse);

      const result = await service.validateOAuthToken({
        provider: OAuthProvider.GOOGLE,
        accessToken: 'valid-token',
      });

      expect(result).toEqual({
        providerId: 'google123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        },
      );
    });

    it('should throw UnauthorizedException for invalid Google token', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        service.validateOAuthToken({
          provider: OAuthProvider.GOOGLE,
          accessToken: 'invalid-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateAppleToken', () => {
    it('should validate Apple token successfully', async () => {
      const idToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhcHBsZTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.test';

      const result = await service.validateOAuthToken({
        provider: OAuthProvider.APPLE,
        accessToken: 'valid-token',
        idToken,
        userData: { fullName: 'Test User' },
      });

      expect(result.providerId).toBe('apple123');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should throw UnauthorizedException when idToken is missing', async () => {
      await expect(
        service.validateOAuthToken({
          provider: OAuthProvider.APPLE,
          accessToken: 'valid-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateVKToken', () => {
    it('should validate VK token successfully', async () => {
      const mockVKUserResponse = {
        data: {
          response: [
            {
              id: 123456,
              first_name: 'Test',
              last_name: 'User',
              photo_200: 'https://example.com/photo.jpg',
            },
          ],
        },
      };

      const mockVKEmailResponse = {
        data: {
          response: {
            email: 'test@example.com',
          },
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockVKUserResponse)
        .mockResolvedValueOnce(mockVKEmailResponse);

      const result = await service.validateOAuthToken({
        provider: OAuthProvider.VK,
        accessToken: 'valid-token',
      });

      expect(result).toEqual({
        providerId: '123456',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/photo.jpg',
      });
    });

    it('should throw UnauthorizedException for invalid VK token', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        service.validateOAuthToken({
          provider: OAuthProvider.VK,
          accessToken: 'invalid-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateYandexToken', () => {
    it('should validate Yandex token successfully', async () => {
      const mockYandexResponse = {
        data: {
          id: 'yandex123',
          default_email: 'test@example.com',
          display_name: 'Test User',
          default_avatar_id: 'avatar123',
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockYandexResponse);

      const result = await service.validateOAuthToken({
        provider: OAuthProvider.YANDEX,
        accessToken: 'valid-token',
      });

      expect(result).toEqual({
        providerId: 'yandex123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://avatars.yandex.net/get-yapic/avatar123/islands-200',
      });
    });

    it('should throw UnauthorizedException for invalid Yandex token', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Invalid token'));

      await expect(
        service.validateOAuthToken({
          provider: OAuthProvider.YANDEX,
          accessToken: 'invalid-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOrCreateOAuthUser', () => {
    it('should return existing user with matching provider and providerId', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.findOrCreateOAuthUser(
        OAuthProvider.GOOGLE,
        {
          providerId: 'google123',
          email: 'test@example.com',
        },
      );

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { provider: OAuthProvider.GOOGLE, providerId: 'google123' },
      });
    });

    it('should link OAuth to existing email account', async () => {
      const existingUser = { ...mockUser, provider: null, providerId: null };
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockResolvedValueOnce({
        ...existingUser,
        provider: OAuthProvider.GOOGLE,
        providerId: 'google123',
      });

      const result = await service.findOrCreateOAuthUser(
        OAuthProvider.GOOGLE,
        {
          providerId: 'google123',
          email: 'test@example.com',
        },
      );

      expect(result.provider).toBe(OAuthProvider.GOOGLE);
      expect(result.providerId).toBe('google123');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email exists with different provider', async () => {
      const existingUser = {
        ...mockUser,
        provider: OAuthProvider.APPLE,
        providerId: 'apple123',
      };
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingUser);

      await expect(
        service.findOrCreateOAuthUser(OAuthProvider.GOOGLE, {
          providerId: 'google123',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create new user if none exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.findOrCreateOAuthUser(
        OAuthProvider.GOOGLE,
        {
          providerId: 'google123',
          email: 'test@example.com',
          name: 'Test User',
        },
      );

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        provider: OAuthProvider.GOOGLE,
        providerId: 'google123',
        providerData: {
          providerId: 'google123',
          email: 'test@example.com',
          name: 'Test User',
        },
        password: null,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
