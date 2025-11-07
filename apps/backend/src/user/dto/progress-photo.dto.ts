import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadPhotoDto {
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'progress-2024-01-15.jpg' })
  filename: string;

  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'Front pose progress photo' })
  originalName: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({ example: 'Feeling good about the progress!' })
  notes?: string;
}