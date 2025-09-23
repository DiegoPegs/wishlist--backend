import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAccessToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header not found or invalid format');
    }

    // Retorna apenas o token, sem a parte "Bearer "
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new Error('Token not found in authorization header');
    }
    return token;
  },
);
