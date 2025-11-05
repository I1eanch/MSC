import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}
