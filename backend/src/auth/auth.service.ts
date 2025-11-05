import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { RefreshTokenResponse } from './dto/refresh-token.dto';
import { JwtPayload, JwtRefreshPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
    });

    await this.emailService.sendWelcomeEmail(user.email, user.email);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user,
    };
  }

  async refresh(userId: string, tokenId: string): Promise<RefreshTokenResponse> {
    const user = await this.usersService.findOne(userId);

    await this.revokeRefreshToken(tokenId);

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + this.configService.get<number>('passwordReset.tokenExpiration');

      await this.usersService.setPasswordResetToken(email, token, expiresAt);
      await this.emailService.sendPasswordResetEmail(email, token);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return;
      }
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    await this.usersService.updatePassword(user.id, newPassword);

    await this.refreshTokenRepository.update(
      { userId: user.id },
      { isRevoked: true },
    );
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async validateRefreshToken(
    userId: string,
    token: string,
    tokenId: string,
  ): Promise<boolean> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: {
        id: tokenId,
        userId,
        token,
        isRevoked: false,
      },
    });

    if (!refreshToken) {
      return false;
    }

    if (Date.now() > refreshToken.expiresAt) {
      await this.revokeRefreshToken(tokenId);
      return false;
    }

    return true;
  }

  private async generateTokens(user: User): Promise<RefreshTokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiration'),
    });

    const refreshTokenId = uuidv4();
    const refreshTokenValue = uuidv4();

    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      tokenId: refreshTokenId,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiration'),
    });

    const expirationMs = this.parseExpirationToMs(
      this.configService.get<string>('jwt.refreshExpiration'),
    );

    await this.storeRefreshToken(
      refreshTokenId,
      user.id,
      refreshTokenValue,
      Date.now() + expirationMs,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(
    id: string,
    userId: string,
    token: string,
    expiresAt: number,
  ): Promise<void> {
    const refreshToken = this.refreshTokenRepository.create({
      id,
      userId,
      token,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  private async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { id: tokenId },
      { isRevoked: true },
    );
  }

  private parseExpirationToMs(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return value;
    }
  }
}
