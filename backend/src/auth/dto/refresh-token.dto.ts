import { ApiProperty } from '@nestjs/swagger';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RefreshTokenResponse {
  @ApiProperty()
  @Field()
  accessToken: string;

  @ApiProperty()
  @Field()
  refreshToken: string;
}
