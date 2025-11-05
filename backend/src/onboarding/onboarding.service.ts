import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserOnboarding } from '../database/entities/user-onboarding.entity';
import { Goal } from '../database/entities/goal.entity';
import { ActivityLevel } from '../database/entities/activity-level.entity';
import { User } from '../database/entities/user.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(UserOnboarding)
    private readonly onboardingRepository: Repository<UserOnboarding>,
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    @InjectRepository(ActivityLevel)
    private readonly activityLevelRepository: Repository<ActivityLevel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getGoals(): Promise<Goal[]> {
    return this.goalRepository.find({ order: { displayOrder: 'ASC' } });
  }

  async getActivityLevels(): Promise<ActivityLevel[]> {
    return this.activityLevelRepository.find({ order: { displayOrder: 'ASC' } });
  }

  async create(userId: string, dto: CreateOnboardingDto): Promise<UserOnboarding> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['goals'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let onboarding = await this.onboardingRepository.findOne({
      where: { userId },
      relations: ['activityLevel'],
    });

    if (onboarding) {
      return this.update(userId, dto);
    }

    onboarding = this.onboardingRepository.create({
      userId,
      age: dto.age,
      gender: dto.gender,
      height: dto.height,
      weight: dto.weight,
      activityLevelId: dto.activityLevelId,
      healthConstraints: dto.healthConstraints,
    });

    if (dto.goalIds && dto.goalIds.length > 0) {
      const goals = await this.goalRepository.findBy({ id: In(dto.goalIds) });
      user.goals = goals;
      await this.userRepository.save(user);
    }

    const completionPercentage = this.calculateCompletionPercentage(onboarding, dto.goalIds);
    onboarding.completionPercentage = completionPercentage;

    return this.onboardingRepository.save(onboarding);
  }

  async update(userId: string, dto: UpdateOnboardingDto): Promise<UserOnboarding> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
      relations: ['activityLevel'],
    });

    if (!onboarding) {
      throw new NotFoundException('Onboarding profile not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['goals'],
    });

    if (dto.age !== undefined) onboarding.age = dto.age;
    if (dto.gender !== undefined) onboarding.gender = dto.gender;
    if (dto.height !== undefined) onboarding.height = dto.height;
    if (dto.weight !== undefined) onboarding.weight = dto.weight;
    if (dto.activityLevelId !== undefined) onboarding.activityLevelId = dto.activityLevelId;
    if (dto.healthConstraints !== undefined) onboarding.healthConstraints = dto.healthConstraints;

    if (dto.goalIds !== undefined) {
      if (dto.goalIds.length > 0) {
        const goals = await this.goalRepository.findBy({ id: In(dto.goalIds) });
        user.goals = goals;
      } else {
        user.goals = [];
      }
      await this.userRepository.save(user);
    }

    const completionPercentage = this.calculateCompletionPercentage(onboarding, dto.goalIds || user.goals.map(g => g.id));
    onboarding.completionPercentage = completionPercentage;

    return this.onboardingRepository.save(onboarding);
  }

  async findByUserId(userId: string): Promise<UserOnboarding | null> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
      relations: ['activityLevel', 'user', 'user.goals'],
    });

    return onboarding;
  }

  private calculateCompletionPercentage(onboarding: UserOnboarding, goalIds?: string[]): number {
    let completed = 0;
    const total = 7;

    if (onboarding.age) completed++;
    if (onboarding.gender) completed++;
    if (onboarding.height) completed++;
    if (onboarding.weight) completed++;
    if (onboarding.activityLevelId) completed++;
    if (onboarding.healthConstraints) completed++;
    if (goalIds && goalIds.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }
}
