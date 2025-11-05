import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Habit, HabitCompletion, HabitTemplate } from '../database/entities';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CompleteHabitDto } from './dto/complete-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectRepository(Habit)
    private habitsRepository: Repository<Habit>,
    @InjectRepository(HabitCompletion)
    private completionsRepository: Repository<HabitCompletion>,
    @InjectRepository(HabitTemplate)
    private templatesRepository: Repository<HabitTemplate>,
  ) {}

  async create(userId: string, createHabitDto: CreateHabitDto): Promise<Habit> {
    const habit = this.habitsRepository.create({
      ...createHabitDto,
      userId,
      currentStreak: 0,
      longestStreak: 0,
    });

    return await this.habitsRepository.save(habit);
  }

  async findAll(userId: string): Promise<Habit[]> {
    return await this.habitsRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Habit> {
    const habit = await this.habitsRepository.findOne({
      where: { id, userId },
      relations: ['completions'],
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${id} not found`);
    }

    return habit;
  }

  async update(id: string, userId: string, updateHabitDto: UpdateHabitDto): Promise<Habit> {
    const habit = await this.findOne(id, userId);

    Object.assign(habit, updateHabitDto);
    return await this.habitsRepository.save(habit);
  }

  async remove(id: string, userId: string): Promise<void> {
    const habit = await this.findOne(id, userId);
    await this.habitsRepository.remove(habit);
  }

  async markComplete(id: string, userId: string, completeHabitDto: CompleteHabitDto): Promise<HabitCompletion> {
    const habit = await this.findOne(id, userId);
    const completedDate = new Date(completeHabitDto.completedDate);
    completedDate.setHours(0, 0, 0, 0);

    const existingCompletion = await this.completionsRepository.findOne({
      where: {
        habitId: id,
        completedDate,
      },
    });

    if (existingCompletion) {
      throw new BadRequestException('Habit already completed for this date');
    }

    const completion = this.completionsRepository.create({
      habitId: id,
      completedDate,
      count: completeHabitDto.count || 1,
      notes: completeHabitDto.notes,
    });

    const savedCompletion = await this.completionsRepository.save(completion);

    habit.lastCompletedAt = new Date();
    await this.updateStreak(habit);

    return savedCompletion;
  }

  async uncompleteHabit(id: string, userId: string, date: string): Promise<void> {
    const habit = await this.findOne(id, userId);
    const completedDate = new Date(date);
    completedDate.setHours(0, 0, 0, 0);

    const completion = await this.completionsRepository.findOne({
      where: {
        habitId: id,
        completedDate,
      },
    });

    if (!completion) {
      throw new NotFoundException('Completion not found for this date');
    }

    await this.completionsRepository.remove(completion);
    await this.updateStreak(habit);
  }

  async getHistory(id: string, userId: string, startDate?: string, endDate?: string) {
    const habit = await this.findOne(id, userId);

    const where: any = { habitId: id };

    if (startDate && endDate) {
      where.completedDate = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.completedDate = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.completedDate = LessThanOrEqual(new Date(endDate));
    }

    const completions = await this.completionsRepository.find({
      where,
      order: { completedDate: 'DESC' },
    });

    return {
      habit: {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      },
      completions: completions.map((c) => ({
        id: c.id,
        completedDate: c.completedDate,
        count: c.count,
        notes: c.notes,
        createdAt: c.createdAt,
      })),
      stats: {
        totalCompletions: completions.length,
        currentStreak: habit.currentStreak,
        longestStreak: habit.longestStreak,
      },
    };
  }

  private async updateStreak(habit: Habit): Promise<void> {
    const completions = await this.completionsRepository.find({
      where: { habitId: habit.id },
      order: { completedDate: 'DESC' },
    });

    if (completions.length === 0) {
      habit.currentStreak = 0;
      habit.longestStreak = Math.max(habit.longestStreak, 0);
      await this.habitsRepository.save(habit);
      return;
    }

    const { currentStreak, longestStreak } = this.calculateStreaks(completions);

    habit.currentStreak = currentStreak;
    habit.longestStreak = Math.max(longestStreak, habit.longestStreak);
    await this.habitsRepository.save(habit);
  }

  calculateStreaks(completions: HabitCompletion[]): { currentStreak: number; longestStreak: number } {
    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const sortedCompletions = completions
      .map((c) => new Date(c.completedDate))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentCompletion = sortedCompletions[0];

    let currentStreak = 0;
    if (
      this.isSameDay(mostRecentCompletion, today) ||
      this.isSameDay(mostRecentCompletion, yesterday)
    ) {
      currentStreak = 1;
      let expectedDate = new Date(mostRecentCompletion);

      for (let i = 1; i < sortedCompletions.length; i++) {
        expectedDate.setDate(expectedDate.getDate() - 1);
        const currentDate = sortedCompletions[i];

        if (this.isSameDay(currentDate, expectedDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i - 1]);
      prevDate.setDate(prevDate.getDate() - 1);

      if (this.isSameDay(sortedCompletions[i], prevDate)) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  async getTemplatesByGoals(goals: string[]): Promise<HabitTemplate[]> {
    if (!goals || goals.length === 0) {
      return await this.templatesRepository.find({
        where: { isDefault: true },
      });
    }

    const templates = await this.templatesRepository
      .createQueryBuilder('template')
      .where('template.goals && :goals', { goals })
      .orWhere('template.isDefault = true')
      .getMany();

    return templates;
  }

  async createFromTemplate(userId: string, templateId: string): Promise<Habit> {
    const template = await this.templatesRepository.findOne({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const habit = this.habitsRepository.create({
      userId,
      name: template.name,
      description: template.description,
      frequency: template.frequency,
      targetCount: template.targetCount,
      color: template.color,
      icon: template.icon,
      goal: template.goals[0],
      currentStreak: 0,
      longestStreak: 0,
    });

    return await this.habitsRepository.save(habit);
  }

  async getAllTemplates(): Promise<HabitTemplate[]> {
    return await this.templatesRepository.find({
      order: { category: 'ASC', name: 'ASC' },
    });
  }
}
