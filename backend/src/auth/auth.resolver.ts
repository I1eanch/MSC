import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { RefreshTokenResponse } from './dto/refresh-token.dto';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  @Public()
  register(@Args('registerDto') registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Mutation(() => AuthResponse)
  @Public()
  login(@Args('loginDto') loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Mutation(() => RefreshTokenResponse)
  @Public()
  @UseGuards(JwtRefreshGuard)
  refresh(@CurrentUser() user: any): Promise<RefreshTokenResponse> {
    return this.authService.refresh(user.id, user.tokenId);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any): Promise<boolean> {
    await this.authService.logout(user.id);
    return true;
  }

  @Mutation(() => Boolean)
  @Public()
  async requestPasswordReset(
    @Args('requestPasswordResetDto') requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<boolean> {
    await this.authService.requestPasswordReset(requestPasswordResetDto.email);
    return true;
  }

  @Mutation(() => Boolean)
  @Public()
  async resetPassword(
    @Args('resetPasswordDto') resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return true;
  }
}
