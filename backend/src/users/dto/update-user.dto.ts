import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';
import { UserRole } from '../../database/entities/user.entity';

@InputType()
export class UpdateUserDto {
  @ApiPropertyOptional({ enum: UserRole })
  @Field(() => UserRole, { nullable: true })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
