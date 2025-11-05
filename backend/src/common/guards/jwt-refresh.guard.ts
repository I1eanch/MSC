import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  getRequest(context: ExecutionContext) {
    const ctx = context.getType();
    
    if (ctx === 'http') {
      return context.switchToHttp().getRequest();
    }
    
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
