import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../../database/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @ApiProperty()
  @Field()
  accessToken: string;

  @ApiProperty()
  @Field()
  refreshToken: string;

  @ApiProperty()
  @Field(() => User)
  user: User;
}
