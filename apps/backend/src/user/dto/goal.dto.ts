import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType, GoalStatus } from '../entities/goal.entity';

export class CreateGoalDto {
  @IsString()
  @MaxLength(200)
  @ApiProperty({ example: 'Lose 10kg in 3 months' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ example: 'Focus on cardio and healthy eating' })
  description?: string;

  @IsEnum(GoalType)
  @ApiProperty({ enum: GoalType, example: GoalType.WEIGHT_LOSS })
  type: GoalType;

  @IsObject()
  @ApiProperty({ 
    example: { weight: 70 },
    description: 'Target values based on goal type' 
  })
  targetValue: {
    weight?: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
    custom?: Record<string, any>;
  };

  @IsDateString()
  @ApiProperty({ example: '2024-12-31' })
  targetDate: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01' })
  startDate?: string;
}

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @ApiPropertyOptional({ example: 'Lose 12kg in 3 months' })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ example: 'Updated description' })
  description?: string;

  @IsOptional()
  @IsEnum(GoalStatus)
  @ApiPropertyOptional({ enum: GoalStatus, example: GoalStatus.COMPLETED })
  status?: GoalStatus;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ 
    example: { weight: 68 },
    description: 'Updated target values' 
  })
  targetValue?: {
    weight?: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
    custom?: Record<string, any>;
  };

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-12-31' })
  targetDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-06-15' })
  completedDate?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ 
    example: { currentWeight: 75, percentageComplete: 60 },
    description: 'Current progress towards goal' 
  })
  progress?: {
    currentWeight?: number;
    currentBodyFat?: number;
    currentMeasurements?: Record<string, number>;
    percentageComplete?: number;
  };
}

export class UpdateGoalProgressDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @ApiPropertyOptional({ example: 75.5, description: 'Current weight in user\'s preferred units' })
  currentWeight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiPropertyOptional({ example: 15.5, description: 'Current body fat percentage' })
  currentBodyFat?: number;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ 
    example: { chest: 95, waist: 80 },
    description: 'Current measurements in user\'s preferred units' 
  })
  currentMeasurements?: Record<string, number>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiPropertyOptional({ example: 65, description: 'Percentage complete (0-100)' })
  percentageComplete?: number;
}