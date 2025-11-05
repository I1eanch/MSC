import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { Goal } from '../database/entities/goal.entity';
import { ActivityLevel } from '../database/entities/activity-level.entity';
import { UserOnboarding } from '../database/entities/user-onboarding.entity';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Resolver(() => UserOnboarding)
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Query(() => [Goal], { name: 'goals' })
  async getGoals(): Promise<Goal[]> {
    return this.onboardingService.getGoals();
  }

  @Public()
  @Query(() => [ActivityLevel], { name: 'activityLevels' })
  async getActivityLevels(): Promise<ActivityLevel[]> {
    return this.onboardingService.getActivityLevels();
  }

  @Mutation(() => UserOnboarding)
  @UseGuards(JwtAuthGuard)
  async createOnboardingProfile(
    @CurrentUser() user: any,
    @Args('input') dto: CreateOnboardingDto,
  ): Promise<UserOnboarding> {
    return this.onboardingService.create(user.userId, dto);
  }

  @Mutation(() => UserOnboarding)
  @UseGuards(JwtAuthGuard)
  async updateOnboardingProfile(
    @CurrentUser() user: any,
    @Args('input') dto: UpdateOnboardingDto,
  ): Promise<UserOnboarding> {
    return this.onboardingService.update(user.userId, dto);
  }

  @Query(() => UserOnboarding, { nullable: true, name: 'myOnboardingProfile' })
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@CurrentUser() user: any): Promise<UserOnboarding | null> {
    return this.onboardingService.findByUserId(user.userId);
  }
}
