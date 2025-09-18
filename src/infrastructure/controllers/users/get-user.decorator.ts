import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: User }>();
    return request.user;
  },
);
