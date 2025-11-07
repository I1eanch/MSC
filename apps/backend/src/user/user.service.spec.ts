import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../user.service';
import { User } from '../entities/user.entity';
import { Goal, GoalStatus, GoalType } from '../entities/goal.entity';
import { ProgressPhoto } from '../entities/progress-photo.entity';
import { Metric } from '../entities/metric.entity';
import { S3Service } from '../s3.service';
import { Repository } from 'typeorm';
import { CreateGoalDto, UpdateGoalDto, UpdateGoalProgressDto } from '../dto/goal.dto';
import { CreateMetricDto } from '../dto/metric.dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let goalRepository: Repository<Goal>;
  let metricRepository: Repository<Metric>;
  let s3Service: S3Service;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    unitSystem: 'metric',
  };

  const mockGoal = {
    id: 'goal-1',
    title: 'Lose 10kg',
    type: GoalType.WEIGHT_LOSS,
    status: GoalStatus.ACTIVE,
    targetValue: { weight: 70 },
    targetDate: new Date('2024-12-31'),
    progress: { percentageComplete: 0 },
    userId: 'user-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Goal),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProgressPhoto),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Metric),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            generateUploadUrl: jest.fn(),
            generateDownloadUrl: jest.fn(),
            deleteFile: jest.fn(),
            getBucketName: jest.fn().mockReturnValue('test-bucket'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    goalRepository = module.get<Repository<Goal>>(getRepositoryToken(Goal));
    metricRepository = module.get<Repository<Metric>>(getRepositoryToken(Metric));
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Goal Management', () => {
    describe('createGoal', () => {
      it('should create a new goal successfully', async () => {
        const createGoalDto: CreateGoalDto = {
          title: 'Lose 10kg',
          type: GoalType.WEIGHT_LOSS,
          targetValue: { weight: 70 },
          targetDate: '2024-12-31',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
        jest.spyOn(goalRepository, 'create').mockReturnValue(mockGoal as Goal);
        jest.spyOn(goalRepository, 'save').mockResolvedValue(mockGoal as Goal);

        const result = await service.createGoal('user-1', createGoalDto);

        expect(result).toEqual(mockGoal);
        expect(goalRepository.create).toHaveBeenCalledWith({
          ...createGoalDto,
          userId: 'user-1',
          startDate: expect.any(Date),
          targetDate: new Date('2024-12-31'),
          progress: { percentageComplete: 0 },
        });
      });
    });

    describe('updateGoalProgress', () => {
      it('should calculate weight loss progress correctly', async () => {
        const goalWithProgress = {
          ...mockGoal,
          progress: { currentWeight: 80 },
        };

        const progressData: UpdateGoalProgressDto = {
          currentWeight: 75,
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(goalWithProgress as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...goalWithProgress,
          progress: { currentWeight: 75, percentageComplete: 50 },
        } as Goal);

        const result = await service.updateGoalProgress('user-1', 'goal-1', progressData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          progress: {
            ...goalWithProgress.progress,
            ...progressData,
            percentageComplete: 50, // (80-75)/(80-70) * 100 = 50%
          },
        });
      });

      it('should calculate weight gain progress correctly', async () => {
        const weightGainGoal = {
          ...mockGoal,
          type: GoalType.WEIGHT_GAIN,
          targetValue: { weight: 90 },
          progress: { currentWeight: 80 },
        };

        const progressData: UpdateGoalProgressDto = {
          currentWeight: 85,
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(weightGainGoal as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...weightGainGoal,
          progress: { currentWeight: 85, percentageComplete: 50 },
        } as Goal);

        const result = await service.updateGoalProgress('user-1', 'goal-1', progressData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          progress: {
            ...weightGainGoal.progress,
            ...progressData,
            percentageComplete: 50, // (85-80)/(90-80) * 100 = 50%
          },
        });
      });

      it('should cap percentage at 100 for overachievement', async () => {
        const progressData: UpdateGoalProgressDto = {
          currentWeight: 65, // Below target of 70
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...mockGoal,
          progress: { currentWeight: 65, percentageComplete: 100 },
        } as Goal);

        const result = await service.updateGoalProgress('user-1', 'goal-1', progressData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          progress: {
            ...mockGoal.progress,
            ...progressData,
            percentageComplete: 100, // Capped at 100%
          },
        });
      });

      it('should not go below 0 for negative progress', async () => {
        const progressData: UpdateGoalProgressDto = {
          currentWeight: 85, // Above starting weight
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...mockGoal,
          progress: { currentWeight: 85, percentageComplete: 0 },
        } as Goal);

        const result = await service.updateGoalProgress('user-1', 'goal-1', progressData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          progress: {
            ...mockGoal.progress,
            ...progressData,
            percentageComplete: 0, // Capped at 0%
          },
        });
      });

      it('should preserve existing progress when updating', async () => {
        const goalWithExistingProgress = {
          ...mockGoal,
          progress: { 
            currentWeight: 78, 
            currentBodyFat: 20,
            percentageComplete: 20 
          },
        };

        const progressData: UpdateGoalProgressDto = {
          currentBodyFat: 18,
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(goalWithExistingProgress as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...goalWithExistingProgress,
          progress: { currentWeight: 78, currentBodyFat: 18, percentageComplete: 20 },
        } as Goal);

        const result = await service.updateGoalProgress('user-1', 'goal-1', progressData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          progress: {
            currentWeight: 78,
            currentBodyFat: 18,
            percentageComplete: 20,
          },
        });
      });
    });

    describe('updateGoal', () => {
      it('should set completedDate when status changes to COMPLETED', async () => {
        const updateData: UpdateGoalDto = {
          status: GoalStatus.COMPLETED,
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...mockGoal,
          status: GoalStatus.COMPLETED,
          completedDate: expect.any(Date),
        } as Goal);

        const result = await service.updateGoal('user-1', 'goal-1', updateData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', {
          ...updateData,
          completedDate: expect.any(Date),
        });
      });

      it('should not change completedDate for other status changes', async () => {
        const updateData: UpdateGoalDto = {
          status: GoalStatus.PAUSED,
        };

        jest.spyOn(goalRepository, 'findOne').mockResolvedValue(mockGoal as Goal);
        jest.spyOn(goalRepository, 'update').mockResolvedValue(undefined);
        jest.spyOn(goalRepository, 'findOne').mockResolvedValue({
          ...mockGoal,
          status: GoalStatus.PAUSED,
        } as Goal);

        const result = await service.updateGoal('user-1', 'goal-1', updateData);

        expect(goalRepository.update).toHaveBeenCalledWith('goal-1', updateData);
        expect(updateData.completedDate).toBeUndefined();
      });
    });
  });

  describe('Metrics Management', () => {
    describe('createMetric', () => {
      it('should create a new metric successfully', async () => {
        const createMetricDto: CreateMetricDto = {
          type: 'weight',
          value: 75.5,
          unit: 'kg',
          recordedDate: '2024-01-15',
          notes: 'Morning weight',
        };

        const mockMetric = {
          id: 'metric-1',
          ...createMetricDto,
          recordedDate: new Date('2024-01-15'),
          userId: 'user-1',
        };

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);
        jest.spyOn(metricRepository, 'create').mockReturnValue(mockMetric as Metric);
        jest.spyOn(metricRepository, 'save').mockResolvedValue(mockMetric as Metric);

        const result = await service.createMetric('user-1', createMetricDto);

        expect(result).toEqual(mockMetric);
        expect(metricRepository.create).toHaveBeenCalledWith({
          ...createMetricDto,
          userId: 'user-1',
          recordedDate: new Date('2024-01-15'),
        });
      });
    });

    describe('getMetrics', () => {
      it('should filter metrics by type', async () => {
        const query = { type: 'weight' as const };
        const mockMetrics = [
          { id: 'metric-1', type: 'weight', value: 75.5 },
          { id: 'metric-2', type: 'weight', value: 76.0 },
        ];

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(mockMetrics),
        };

        jest.spyOn(metricRepository, 'findAndCount').mockResolvedValue([mockMetrics, 2]);

        const result = await service.getMetrics('user-1', query);

        expect(metricRepository.findAndCount).toHaveBeenCalledWith({
          where: { userId: 'user-1', type: 'weight' },
          order: { recordedDate: 'DESC' },
          take: 50,
          skip: 0,
        });
        expect(result.metrics).toEqual(mockMetrics);
        expect(result.total).toBe(2);
      });

      it('should filter metrics by date range', async () => {
        const query = {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        };

        jest.spyOn(metricRepository, 'findAndCount').mockResolvedValue([[], 0]);

        await service.getMetrics('user-1', query);

        expect(metricRepository.findAndCount).toHaveBeenCalledWith({
          where: {
            userId: 'user-1',
            recordedDate: expect.any(Object),
          },
          order: { recordedDate: 'DESC' },
          take: 50,
          skip: 0,
        });
      });
    });
  });

  describe('Progress Summary', () => {
    it('should aggregate user progress data correctly', async () => {
      const mockUserWithRelations = {
        ...mockUser,
        goals: [mockGoal],
        progressPhotos: [],
        metrics: [],
      };

      const mockActiveGoals = [mockGoal];
      const mockPhotos = [];
      const mockMetricsData = { metrics: [], total: 0 };

      jest.spyOn(service, 'getUserById').mockResolvedValue(mockUserWithRelations as User);
      jest.spyOn(service, 'getGoals').mockResolvedValue(mockActiveGoals as Goal[]);
      jest.spyOn(service, 'getProgressPhotos').mockResolvedValue(mockPhotos as ProgressPhoto[]);
      jest.spyOn(service, 'getMetrics').mockResolvedValue(mockMetricsData);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(metricRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.getProgressSummary('user-1');

      expect(result).toEqual({
        user: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          unitSystem: 'metric',
        },
        goals: {
          active: 1,
          total: 1,
          items: mockActiveGoals,
        },
        photos: {
          total: 0,
          recent: mockPhotos,
        },
        metrics: {
          total: 0,
          latest: [],
          recent: [],
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(
        'User with ID non-existent not found',
      );
    });

    it('should throw NotFoundException when goal not found', async () => {
      jest.spyOn(goalRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getGoalById('user-1', 'non-existent')).rejects.toThrow(
        'Goal with ID non-existent not found',
      );
    });

    it('should throw NotFoundException when metric not found', async () => {
      jest.spyOn(metricRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getMetricById('user-1', 'non-existent')).rejects.toThrow(
        'Metric with ID non-existent not found',
      );
    });
  });
});