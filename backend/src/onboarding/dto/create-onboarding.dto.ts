import { IsOptional, IsNumber, IsString, IsUUID, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateOnboardingDto {
  @ApiProperty({ required: false, example: 25 })
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(150)
  age?: number;

  @ApiProperty({ required: false, example: 'male' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ required: false, example: 175.5 })
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiProperty({ required: false, example: 70.0 })
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ required: false, example: 'uuid-of-activity-level' })
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  activityLevelId?: string;

  @ApiProperty({ required: false, example: 'None' })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  healthConstraints?: string;

  @ApiProperty({ required: false, example: ['uuid1', 'uuid2'] })
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  goalIds?: string[];
}
