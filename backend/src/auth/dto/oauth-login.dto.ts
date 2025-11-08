import { IsString, IsEnum, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

export enum OAuthProvider {
  APPLE = 'apple',
  GOOGLE = 'google',
  VK = 'vk',
  YANDEX = 'yandex',
}

@InputType()
export class OAuthLoginDto {
  @Field()
  @IsEnum(OAuthProvider)
  @IsNotEmpty()
  provider: OAuthProvider;

  @Field()
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  idToken?: string;

  @Field({ nullable: true })
  @IsObject()
  @IsOptional()
  userData?: any;
}
