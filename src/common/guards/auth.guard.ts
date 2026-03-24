import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '../../utils/supabase-client';
import { IUser } from '../dto/types';

interface RequestWithUser {
  user: IUser;
  headers: {
    authorization?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authorization.replace('Bearer ', '');

    try {
      // Verify JWT token
      const { data: authData, error } = await supabase.auth.getUser(token);

      if (error || !authData.user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Fetch user from application table
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single<IUser>();

      if (userError || !user) {
        throw new UnauthorizedException('User not found');
      }

      // Attach user to request
      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
