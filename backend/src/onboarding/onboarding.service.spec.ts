import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UserOnboarding } from '../database/entities/user-onboarding.entity';
import { Goal } from '../database/entities/goal.entity';
import { ActivityLevel } from '../database/entities/activity-level.entity';
import { User } from '../database/entities/user.entity';

describe('OnboardingService', () => {
  let service: OnboardingService;
  let onboardingRepository: Repository<UserOnboarding>;
  let goalRepository: Repository<Goal>;
  let activityLevelRepository: Repository<ActivityLevel>;
  let userRepository: Repository<User>;

  const mockOnboardingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockGoalRepository = {
    find: jest.fn(),
    findBy: jest.fn(),
  };

  const mockActivityLevelRepository = {
    find: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getRepositoryToken(UserOnboarding),
          useValue: mockOnboardingRepository,
        },
        {
          provide: getRepositoryToken(Goal),
          useValue: mockGoalRepository,
        },
        {
          provide: getRepositoryToken(ActivityLevel),
          useValue: mockActivityLevelRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
    onboardingRepository = module.get(getRepositoryToken(UserOnboarding));
    goalRepository = module.get(getRepositoryToken(Goal));
    activityLevelRepository = module.get(getRepositoryToken(ActivityLevel));
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGoals', () => {
    it('should return array of goals', async () => {
      const mockGoals = [
        { id: '1', name: 'Weight Loss', description: 'Lose weight', displayOrder: 1 },
        { id: '2', name: 'Muscle Gain', description: 'Build muscle', displayOrder: 2 },
      ];

      mockGoalRepository.find.mockResolvedValue(mockGoals);

      const result = await service.getGoals();

      expect(result).toEqual(mockGoals);
      expect(mockGoalRepository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
    });
  });

  describe('getActivityLevels', () => {
    it('should return array of activity levels', async () => {
      const mockLevels = [
        { id: '1', name: 'Sedentary', description: 'Little exercise', displayOrder: 1 },
        { id: '2', name: 'Active', description: 'Regular exercise', displayOrder: 2 },
      ];

      mockActivityLevelRepository.find.mockResolvedValue(mockLevels);

      const result = await service.getActivityLevels();

      expect(result).toEqual(mockLevels);
      expect(mockActivityLevelRepository.find).toHaveBeenCalledWith({ order: { displayOrder: 'ASC' } });
    });
  });

  describe('create', () => {
    it('should create onboarding profile', async () => {
      const userId = 'user-123';
      const dto = {
        age: 25,
        gender: 'male',
        height: 180,
        weight: 75,
        activityLevelId: 'level-1',
        healthConstraints: 'None',
        goalIds: ['goal-1'],
      };

      const mockUser = { id: userId, goals: [] };
      const mockGoals = [{ id: 'goal-1', name: 'Weight Loss' }];
      const mockOnboarding = {
        id: 'onboarding-1',
        userId,
        ...dto,
        completionPercentage: 100,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockOnboardingRepository.findOne.mockResolvedValue(null);
      mockGoalRepository.findBy.mockResolvedValue(mockGoals);
      mockOnboardingRepository.create.mockReturnValue(mockOnboarding);
      mockOnboardingRepository.save.mockResolvedValue(mockOnboarding);

      const result = await service.create(userId, dto);

      expect(result).toBeDefined();
      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(mockOnboardingRepository.create).toHaveBeenCalled();
      expect(mockOnboardingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'user-123';
      const dto = { age: 25 };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return user onboarding profile', async () => {
      const userId = 'user-123';
      const mockOnboarding = {
        id: 'onboarding-1',
        userId,
        age: 25,
        completionPercentage: 50,
      };

      mockOnboardingRepository.findOne.mockResolvedValue(mockOnboarding);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(mockOnboarding);
      expect(mockOnboardingRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ['activityLevel', 'user', 'user.goals'],
      });
    });

    it('should return null if profile not found', async () => {
      const userId = 'user-123';

      mockOnboardingRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId(userId);

      expect(result).toBeNull();
    });
  });
});
