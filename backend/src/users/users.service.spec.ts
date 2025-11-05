import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from '../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;

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

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(userRepository.find).toHaveBeenCalledWith({
        select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      });
    });

    it('should return empty array if no users exist', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow(`User with ID ${userId} not found`);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
      const updateUserDto = {
        role: UserRole.TRAINER,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      const updateUserDto = { role: UserRole.TRAINER };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should successfully remove a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validatePassword('password123', 'hashedPassword');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword('wrongpassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should successfully update user password', async () => {
      const newPassword = 'newPassword123';
      
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await service.updatePassword(mockUser.id, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'non-existent-id';
      const newPassword = 'newPassword123';
      
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePassword(userId, newPassword)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setPasswordResetToken', () => {
    it('should set password reset token for user', async () => {
      const token = 'reset-token';
      const expiresAt = Date.now() + 3600000;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.setPasswordResetToken(mockUser.email, token, expiresAt);

      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const token = 'reset-token';
      const expiresAt = Date.now() + 3600000;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setPasswordResetToken('nonexistent@example.com', token, expiresAt),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPasswordResetToken', () => {
    it('should return user with valid reset token', async () => {
      const token = 'valid-token';
      const userWithToken = {
        ...mockUser,
        passwordResetToken: token,
        passwordResetExpires: Date.now() + 3600000,
      };

      mockUserRepository.findOne.mockResolvedValue(userWithToken);

      const result = await service.findByPasswordResetToken(token);

      expect(result).toEqual(userWithToken);
    });

    it('should return null if token not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByPasswordResetToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null if token is expired', async () => {
      const token = 'expired-token';
      const userWithExpiredToken = {
        ...mockUser,
        passwordResetToken: token,
        passwordResetExpires: Date.now() - 3600000,
      };

      mockUserRepository.findOne.mockResolvedValue(userWithExpiredToken);

      const result = await service.findByPasswordResetToken(token);

      expect(result).toBeNull();
    });
  });
});
