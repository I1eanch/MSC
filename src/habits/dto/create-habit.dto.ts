import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { HabitFrequency } from '../../database/entities/habit.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ReminderDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty()
  @IsString()
  time: string;
}

export class CreateHabitDto {
  @ApiProperty({ description: 'Habit name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Habit description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: HabitFrequency, default: HabitFrequency.DAILY })
  @IsOptional()
  @IsEnum(HabitFrequency)
  frequency?: HabitFrequency;

  @ApiPropertyOptional({ description: 'Target count for habit completion' })
  @IsOptional()
  @IsNumber()
  targetCount?: number;

  @ApiPropertyOptional({ description: 'Color code for habit' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Icon identifier for habit' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Reminder settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderDto)
  reminder?: ReminderDto;

  @ApiPropertyOptional({ description: 'Associated goal' })
  @IsOptional()
  @IsString()
  goal?: string;
}
