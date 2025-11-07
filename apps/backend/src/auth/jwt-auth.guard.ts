import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // For development/testing purposes, we'll mock authentication
    const request = context.switchToHttp().getRequest();
    
    // In production, this would validate the JWT token
    // For now, we'll simulate an authenticated user
    request.user = {
      id: 'mock-user-id',
      email: 'test@example.com',
    };
    
    return true;
  }
}