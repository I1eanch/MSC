import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsEmail()
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 175 })
  height?: number;

  @IsOptional()
  @IsEnum(['metric', 'imperial'])
  @ApiPropertyOptional({ enum: ['metric', 'imperial'], example: 'metric' })
  unitSystem?: 'metric' | 'imperial';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '1990-01-01' })
  dateOfBirth?: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ example: 175 })
  height?: number;

  @IsOptional()
  @IsEnum(['metric', 'imperial'])
  @ApiPropertyOptional({ enum: ['metric', 'imperial'], example: 'metric' })
  unitSystem?: 'metric' | 'imperial';
}