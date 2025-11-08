import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../../database/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user;

    return requiredRoles.some((role) => user?.role === role);
  }

  private getRequest(context: ExecutionContext) {
    const ctx = context.getType();
    
    if (ctx === 'http') {
      return context.switchToHttp().getRequest();
    }
    
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
