import { IsDateString, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteHabitDto {
  @ApiProperty({ description: 'Date of completion in ISO format' })
  @IsDateString()
  completedDate: string;

  @ApiPropertyOptional({ description: 'Count of completions', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  count?: number;

  @ApiPropertyOptional({ description: 'Optional notes for completion' })
  @IsOptional()
  @IsString()
  notes?: string;
}
