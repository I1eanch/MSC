import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HabitHistoryQueryDto {
  @ApiPropertyOptional({ description: 'Start date for history query' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for history query' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
