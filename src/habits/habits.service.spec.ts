import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HabitsService } from './habits.service';
import { Habit, HabitCompletion, HabitTemplate } from '../database/entities';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('HabitsService', () => {
  let service: HabitsService;
  let habitsRepository: Repository<Habit>;
  let completionsRepository: Repository<HabitCompletion>;
  let templatesRepository: Repository<HabitTemplate>;

  const mockHabitsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCompletionsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockTemplatesRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HabitsService,
        {
          provide: getRepositoryToken(Habit),
          useValue: mockHabitsRepository,
        },
        {
          provide: getRepositoryToken(HabitCompletion),
          useValue: mockCompletionsRepository,
        },
        {
          provide: getRepositoryToken(HabitTemplate),
          useValue: mockTemplatesRepository,
        },
      ],
    }).compile();

    service = module.get<HabitsService>(HabitsService);
    habitsRepository = module.get(getRepositoryToken(Habit));
    completionsRepository = module.get(getRepositoryToken(HabitCompletion));
    templatesRepository = module.get(getRepositoryToken(HabitTemplate));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateStreaks', () => {
    it('should return 0 streaks for empty completions array', () => {
      const result = service.calculateStreaks([]);
      expect(result).toEqual({ currentStreak: 0, longestStreak: 0 });
    });

    it('should calculate current streak correctly for consecutive days including today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const completions = [
        { completedDate: today } as HabitCompletion,
        { completedDate: yesterday } as HabitCompletion,
        { completedDate: twoDaysAgo } as HabitCompletion,
      ];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(3);
    });

    it('should calculate current streak correctly for consecutive days including yesterday', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const completions = [
        { completedDate: yesterday } as HabitCompletion,
        { completedDate: twoDaysAgo } as HabitCompletion,
      ];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);
    });

    it('should return 0 current streak when most recent completion is older than yesterday', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const fourDaysAgo = new Date(today);
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

      const completions = [
        { completedDate: threeDaysAgo } as HabitCompletion,
        { completedDate: fourDaysAgo } as HabitCompletion,
      ];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(2);
    });

    it('should calculate longest streak correctly with gaps', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date);
      }

      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const elevenDaysAgo = new Date(today);
      elevenDaysAgo.setDate(elevenDaysAgo.getDate() - 11);

      const twelveDaysAgo = new Date(today);
      twelveDaysAgo.setDate(twelveDaysAgo.getDate() - 12);

      const completions = [
        ...dates.map((d) => ({ completedDate: d } as HabitCompletion)),
        { completedDate: tenDaysAgo } as HabitCompletion,
        { completedDate: elevenDaysAgo } as HabitCompletion,
        { completedDate: twelveDaysAgo } as HabitCompletion,
      ];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(5);
      expect(result.longestStreak).toBe(5);
    });

    it('should handle single completion today', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completions = [{ completedDate: today } as HabitCompletion];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });

    it('should handle single completion yesterday', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const completions = [{ completedDate: yesterday } as HabitCompletion];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });

    it('should find longest streak in the middle of history', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const createDate = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date;
      };

      const completions = [
        { completedDate: createDate(0) } as HabitCompletion,
        { completedDate: createDate(5) } as HabitCompletion,
        { completedDate: createDate(6) } as HabitCompletion,
        { completedDate: createDate(7) } as HabitCompletion,
        { completedDate: createDate(8) } as HabitCompletion,
        { completedDate: createDate(9) } as HabitCompletion,
        { completedDate: createDate(15) } as HabitCompletion,
      ];

      const result = service.calculateStreaks(completions);
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(5);
    });
  });

  describe('create', () => {
    it('should create a new habit', async () => {
      const userId = 'user-123';
      const createHabitDto = {
        name: 'Morning Exercise',
        description: '30 minutes cardio',
        frequency: 'daily' as any,
      };

      const mockHabit = {
        id: 'habit-123',
        ...createHabitDto,
        userId,
        currentStreak: 0,
        longestStreak: 0,
      };

      mockHabitsRepository.create.mockReturnValue(mockHabit);
      mockHabitsRepository.save.mockResolvedValue(mockHabit);

      const result = await service.create(userId, createHabitDto);

      expect(habitsRepository.create).toHaveBeenCalledWith({
        ...createHabitDto,
        userId,
        currentStreak: 0,
        longestStreak: 0,
      });
      expect(habitsRepository.save).toHaveBeenCalledWith(mockHabit);
      expect(result).toEqual(mockHabit);
    });
  });

  describe('findOne', () => {
    it('should find and return a habit', async () => {
      const habitId = 'habit-123';
      const userId = 'user-123';
      const mockHabit = { id: habitId, userId, name: 'Test Habit' };

      mockHabitsRepository.findOne.mockResolvedValue(mockHabit);

      const result = await service.findOne(habitId, userId);

      expect(habitsRepository.findOne).toHaveBeenCalledWith({
        where: { id: habitId, userId },
        relations: ['completions'],
      });
      expect(result).toEqual(mockHabit);
    });

    it('should throw NotFoundException when habit not found', async () => {
      const habitId = 'non-existent';
      const userId = 'user-123';

      mockHabitsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(habitId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('markComplete', () => {
    it('should throw BadRequestException if habit already completed for date', async () => {
      const habitId = 'habit-123';
      const userId = 'user-123';
      const mockHabit = { id: habitId, userId, name: 'Test Habit' };
      const completeDto = {
        completedDate: new Date().toISOString(),
        count: 1,
      };

      mockHabitsRepository.findOne.mockResolvedValue(mockHabit);
      mockCompletionsRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.markComplete(habitId, userId, completeDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create completion and update streak', async () => {
      const habitId = 'habit-123';
      const userId = 'user-123';
      const mockHabit = {
        id: habitId,
        userId,
        name: 'Test Habit',
        currentStreak: 0,
        longestStreak: 0,
      };
      const completeDto = {
        completedDate: new Date().toISOString(),
        count: 1,
      };

      const mockCompletion = {
        id: 'completion-123',
        habitId,
        completedDate: new Date(completeDto.completedDate),
        count: 1,
      };

      mockHabitsRepository.findOne.mockResolvedValue(mockHabit);
      mockCompletionsRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue(null);
      mockCompletionsRepository.create.mockReturnValue(mockCompletion);
      mockCompletionsRepository.save.mockResolvedValue(mockCompletion);
      mockCompletionsRepository.find.mockResolvedValue([mockCompletion]);
      mockHabitsRepository.save.mockResolvedValue(mockHabit);

      const result = await service.markComplete(habitId, userId, completeDto);

      expect(completionsRepository.create).toHaveBeenCalled();
      expect(completionsRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockCompletion);
    });
  });
});
