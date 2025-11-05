import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class OnboardingResponseDto {
  @ApiProperty()
  @Field(() => ID)
  id: string;

  @ApiProperty()
  @Field(() => ID)
  userId: string;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  age?: number;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  gender?: string;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  height?: number;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  weight?: number;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  activityLevelId?: string;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  healthConstraints?: string;

  @ApiProperty({ required: false })
  @Field(() => [String], { nullable: true })
  goalIds?: string[];

  @ApiProperty()
  @Field(() => Int)
  completionPercentage: number;

  @ApiProperty()
  @Field()
  createdAt: Date;

  @ApiProperty()
  @Field()
  updatedAt: Date;
}
