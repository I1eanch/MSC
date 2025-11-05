import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = context.getType();
    
    if (ctx === 'http') {
      return context.switchToHttp().getRequest().user;
    }
    
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req.user;
  },
);
