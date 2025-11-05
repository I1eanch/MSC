import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordDto {
  @ApiProperty({ example: 'token-from-email' })
  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @Field()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
