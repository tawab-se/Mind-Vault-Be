import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUser } from '../dto/types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IUser => {
    const request = ctx.switchToHttp().getRequest<{ user: IUser }>();
    return request.user;
  },
);
