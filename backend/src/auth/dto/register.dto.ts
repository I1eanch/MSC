import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
