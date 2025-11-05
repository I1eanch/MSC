import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingResolver } from './onboarding.resolver';
import { UserOnboarding } from '../database/entities/user-onboarding.entity';
import { Goal } from '../database/entities/goal.entity';
import { ActivityLevel } from '../database/entities/activity-level.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOnboarding, Goal, ActivityLevel, User]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingResolver],
  exports: [OnboardingService],
})
export class OnboardingModule {}
