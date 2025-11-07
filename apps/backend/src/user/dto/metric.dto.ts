import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetricType } from '../entities/metric.entity';

export class CreateMetricDto {
  @IsEnum(MetricType)
  @ApiProperty({ enum: MetricType, example: MetricType.WEIGHT })
  type: MetricType;

  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiProperty({ example: 75.5, description: 'Value in appropriate units' })
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({ example: 'kg', description: 'Unit of measurement' })
  unit?: string;

  @IsDateString()
  @ApiProperty({ example: '2024-01-15' })
  recordedDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ example: 'Morning weight after workout' })
  notes?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ 
    example: { timeOfDay: 'morning', afterWorkout: true },
    description: 'Additional context for the metric' 
  })
  additionalData?: Record<string, any>;
}

export class UpdateMetricDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiPropertyOptional({ example: 76.0 })
  value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @ApiPropertyOptional({ example: 'kg' })
  unit?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-15' })
  recordedDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ example: 'Updated notes' })
  notes?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ 
    example: { timeOfDay: 'evening', beforeMeal: true },
    description: 'Updated additional context' 
  })
  additionalData?: Record<string, any>;
}

export class GetMetricsQueryDto {
  @IsOptional()
  @IsEnum(MetricType)
  @ApiPropertyOptional({ enum: MetricType, example: MetricType.WEIGHT })
  type?: MetricType;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-01-01', description: 'Start date for filtering' })
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({ example: '2024-12-31', description: 'End date for filtering' })
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({ example: 50, description: 'Number of records to return' })
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 0, description: 'Number of records to skip' })
  offset?: number;
}