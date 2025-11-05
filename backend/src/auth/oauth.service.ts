import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { OAuthLoginDto, OAuthProvider } from './dto/oauth-login.dto';

interface OAuthUserInfo {
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateOAuthToken(
    oauthDto: OAuthLoginDto,
  ): Promise<OAuthUserInfo> {
    switch (oauthDto.provider) {
      case OAuthProvider.GOOGLE:
        return this.validateGoogleToken(oauthDto);
      case OAuthProvider.APPLE:
        return this.validateAppleToken(oauthDto);
      case OAuthProvider.VK:
        return this.validateVKToken(oauthDto);
      case OAuthProvider.YANDEX:
        return this.validateYandexToken(oauthDto);
      default:
        throw new BadRequestException('Unsupported OAuth provider');
    }
  }

  async findOrCreateOAuthUser(
    provider: OAuthProvider,
    userInfo: OAuthUserInfo,
    providerData?: any,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { provider, providerId: userInfo.providerId },
    });

    if (user) {
      return user;
    }

    user = await this.userRepository.findOne({
      where: { email: userInfo.email },
    });

    if (user) {
      if (user.provider && user.provider !== provider) {
        throw new BadRequestException(
          `This email is already linked with ${user.provider}. Please use that provider to sign in.`,
        );
      }

      user.provider = provider;
      user.providerId = userInfo.providerId;
      user.providerData = providerData || userInfo;
      await this.userRepository.save(user);
      return user;
    }

    const newUser = this.userRepository.create({
      email: userInfo.email,
      provider,
      providerId: userInfo.providerId,
      providerData: providerData || userInfo,
      password: null,
    });

    return this.userRepository.save(newUser);
  }

  private async validateGoogleToken(
    oauthDto: OAuthLoginDto,
  ): Promise<OAuthUserInfo> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${oauthDto.accessToken}`,
          },
        },
      );

      const { sub, email, name, picture } = response.data;

      if (!sub || !email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        providerId: sub,
        email,
        name,
        picture,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate Google token');
    }
  }

  private async validateAppleToken(
    oauthDto: OAuthLoginDto,
  ): Promise<OAuthUserInfo> {
    try {
      if (!oauthDto.idToken) {
        throw new UnauthorizedException('ID token is required for Apple Sign In');
      }

      const jwtPayload = this.decodeJWT(oauthDto.idToken);

      if (!jwtPayload.sub || !jwtPayload.email) {
        throw new UnauthorizedException('Invalid Apple token');
      }

      return {
        providerId: jwtPayload.sub,
        email: jwtPayload.email,
        name: oauthDto.userData?.fullName,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate Apple token');
    }
  }

  private async validateVKToken(
    oauthDto: OAuthLoginDto,
  ): Promise<OAuthUserInfo> {
    try {
      const response = await axios.get('https://api.vk.com/method/users.get', {
        params: {
          access_token: oauthDto.accessToken,
          fields: 'photo_200',
          v: '5.131',
        },
      });

      if (!response.data.response || response.data.error) {
        throw new UnauthorizedException('Invalid VK token');
      }

      const user = response.data.response[0];

      const emailResponse = await axios.get(
        'https://api.vk.com/method/account.getProfileInfo',
        {
          params: {
            access_token: oauthDto.accessToken,
            v: '5.131',
          },
        },
      );

      const email = emailResponse.data.response?.email;

      if (!email) {
        throw new UnauthorizedException('Email is required for VK authentication');
      }

      return {
        providerId: user.id.toString(),
        email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        picture: user.photo_200,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate VK token');
    }
  }

  private async validateYandexToken(
    oauthDto: OAuthLoginDto,
  ): Promise<OAuthUserInfo> {
    try {
      const response = await axios.get('https://login.yandex.ru/info', {
        headers: {
          Authorization: `OAuth ${oauthDto.accessToken}`,
        },
      });

      const { id, default_email, display_name, default_avatar_id } = response.data;

      if (!id || !default_email) {
        throw new UnauthorizedException('Invalid Yandex token');
      }

      return {
        providerId: id,
        email: default_email,
        name: display_name,
        picture: default_avatar_id
          ? `https://avatars.yandex.net/get-yapic/${default_avatar_id}/islands-200`
          : undefined,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to validate Yandex token');
    }
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }
      const payload = Buffer.from(parts[1], 'base64').toString('utf8');
      return JSON.parse(payload);
    } catch (error) {
      throw new UnauthorizedException('Failed to decode JWT');
    }
  }
}
