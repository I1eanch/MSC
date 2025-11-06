import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = client.handshake.auth.token || client.handshake.query.token;

      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.authService.findById(payload.sub);

      if (!user || !user.isActive) {
        return false;
      }

      client.user = user;
      return true;
    } catch (error) {
      return false;
    }
  }
}