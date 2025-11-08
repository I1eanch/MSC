import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RequestPasswordResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
