import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Goal } from '../database/entities/goal.entity';
import { ActivityLevel } from '../database/entities/activity-level.entity';
import { UserOnboarding } from '../database/entities/user-onboarding.entity';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Public()
  @Get('goals')
  @ApiOperation({ summary: 'Get all available goals' })
  @ApiResponse({ status: 200, description: 'List of goals retrieved successfully' })
  async getGoals(): Promise<Goal[]> {
    return this.onboardingService.getGoals();
  }

  @Public()
  @Get('activity-levels')
  @ApiOperation({ summary: 'Get all activity levels' })
  @ApiResponse({ status: 200, description: 'List of activity levels retrieved successfully' })
  async getActivityLevels(): Promise<ActivityLevel[]> {
    return this.onboardingService.getActivityLevels();
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update onboarding profile' })
  @ApiResponse({ status: 201, description: 'Onboarding profile created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createProfile(
    @CurrentUser() user: any,
    @Body() dto: CreateOnboardingDto,
  ): Promise<UserOnboarding> {
    return this.onboardingService.create(user.userId, dto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update onboarding profile' })
  @ApiResponse({ status: 200, description: 'Onboarding profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateOnboardingDto,
  ): Promise<UserOnboarding> {
    return this.onboardingService.update(user.userId, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user onboarding profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@CurrentUser() user: any): Promise<UserOnboarding | null> {
    return this.onboardingService.findByUserId(user.userId);
  }
}
