import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { User, UserRole } from '../database/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let emailService: EmailService;
  let refreshTokenRepository: any;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: UserRole.USER,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
  };

  const mockRefreshTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
    setPasswordResetToken: jest.fn(),
    findByPasswordResetToken: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'jwt.accessSecret': 'access-secret',
        'jwt.accessExpiration': '15m',
        'jwt.refreshSecret': 'refresh-secret',
        'jwt.refreshExpiration': '7d',
        'passwordReset.tokenExpiration': 3600000,
      };
      return config[key];
    }),
  };

  const mockEmailService = {
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(mockUser.email, mockUser.email);
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(new Error('User already exists'));

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException with invalid email', async () => {
      const loginDto = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should successfully refresh tokens', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const tokenId = '123e4567-e89b-12d3-a456-426614174001';

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockRefreshTokenRepository.update.mockResolvedValue({});
      mockJwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
      mockRefreshTokenRepository.create.mockReturnValue({});
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await service.refresh(userId, tokenId);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(refreshTokenRepository.update).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should revoke all user refresh tokens', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockRefreshTokenRepository.update.mockResolvedValue({});

      await service.logout(userId);

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId, isRevoked: false },
        { isRevoked: true },
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email for existing user', async () => {
      const email = 'test@example.com';

      mockUsersService.setPasswordResetToken.mockResolvedValue(undefined);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      await service.requestPasswordReset(email);

      expect(usersService.setPasswordResetToken).toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should not throw error for non-existing user', async () => {
      const email = 'nonexistent@example.com';

      mockUsersService.setPasswordResetToken.mockRejectedValue(new Error('User not found'));

      await expect(service.requestPasswordReset(email)).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid token', async () => {
      const token = 'valid-token';
      const newPassword = 'newPassword123';

      mockUsersService.findByPasswordResetToken.mockResolvedValue(mockUser);
      mockUsersService.updatePassword.mockResolvedValue(undefined);
      mockRefreshTokenRepository.update.mockResolvedValue({});

      await service.resetPassword(token, newPassword);

      expect(usersService.findByPasswordResetToken).toHaveBeenCalledWith(token);
      expect(usersService.updatePassword).toHaveBeenCalledWith(mockUser.id, newPassword);
      expect(refreshTokenRepository.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException with invalid token', async () => {
      const token = 'invalid-token';
      const newPassword = 'newPassword123';

      mockUsersService.findByPasswordResetToken.mockResolvedValue(null);

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        'Invalid or expired password reset token',
      );
    });
  });

  describe('validateRefreshToken', () => {
    it('should return true for valid refresh token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const token = 'refresh-token';
      const tokenId = '123e4567-e89b-12d3-a456-426614174001';

      const mockRefreshToken = {
        id: tokenId,
        userId,
        token,
        isRevoked: false,
        expiresAt: Date.now() + 3600000,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);

      const result = await service.validateRefreshToken(userId, token, tokenId);

      expect(result).toBe(true);
    });

    it('should return false for non-existent token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const token = 'invalid-token';
      const tokenId = '123e4567-e89b-12d3-a456-426614174001';

      mockRefreshTokenRepository.findOne.mockResolvedValue(null);

      const result = await service.validateRefreshToken(userId, token, tokenId);

      expect(result).toBe(false);
    });

    it('should return false and revoke expired token', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const token = 'refresh-token';
      const tokenId = '123e4567-e89b-12d3-a456-426614174001';

      const mockRefreshToken = {
        id: tokenId,
        userId,
        token,
        isRevoked: false,
        expiresAt: Date.now() - 3600000,
      };

      mockRefreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken);
      mockRefreshTokenRepository.update.mockResolvedValue({});

      const result = await service.validateRefreshToken(userId, token, tokenId);

      expect(result).toBe(false);
      expect(refreshTokenRepository.update).toHaveBeenCalled();
    });
  });
});
