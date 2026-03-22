import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string, metadata?: any) {
    try {
      const result = await this.supabaseService.signUp(email, password, metadata);
      return {
        user: result.user,
        session: result.session,
      };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Sign up failed');
    }
  }

  async signIn(email: string, password: string) {
    try {
      const result = await this.supabaseService.signIn(email, password);
      return {
        user: result.user,
        session: result.session,
      };
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }

  async signOut() {
    try {
      return await this.supabaseService.signOut();
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Sign up failed');
    }
  }

  async getProfile(accessToken: string) {
    try {
      const user = await this.supabaseService.getUser(accessToken);
      return user;
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const result = await this.supabaseService.refreshToken(refreshToken);
      return {
        session: result.session,
        user: result.user,
      };
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }

  async resetPassword(email: string) {
    try {
      return await this.supabaseService.resetPasswordForEmail(email);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Sign up failed');
    }
  }

  async updatePassword(accessToken: string, newPassword: string) {
    try {
      return await this.supabaseService.updatePassword(accessToken, newPassword);
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Sign up failed');
    }
  }

  async validateUser(accessToken: string) {
    try {
      const user = await this.supabaseService.getUser(accessToken);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}