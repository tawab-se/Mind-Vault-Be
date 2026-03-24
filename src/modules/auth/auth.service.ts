import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { supabase } from '../../utils/supabase-client';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  IUser,
  IOrganization,
  IInvitation,
  IAuthResponse,
  ISignupResponse,
  ISupabaseAuthData,
} from '../../common/dto/types';

@Injectable()
export class AuthService {
  async signup(dto: SignupDto): Promise<ISignupResponse | IAuthResponse> {
    // CASE 1: Signup with invitation token
    if (dto.invitation_token) {
      return await this.signupWithInvitation(dto);
    }

    // CASE 2: Normal signup (create new organization)
    if (!dto.organization_name) {
      throw new BadRequestException(
        'organization_name is required when not using an invitation',
      );
    }

    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: dto.organization_name })
      .select()
      .single<IOrganization>();

    if (orgError || !org) {
      throw new BadRequestException(
        `Failed to create organization: ${orgError?.message || 'Unknown error'}`,
      );
    }

    // 2. Check if email contains +test for auto-activation
    const shouldAutoActivate = dto.email.includes('+test');

    // 3. Create Supabase auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: shouldAutoActivate,
      });

    if (authError || !authData.user) {
      // Rollback: delete organization
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new BadRequestException(
        `Failed to create user: ${authError?.message || 'Unknown error'}`,
      );
    }

    // 4. Create user in application table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: dto.email,
        organization_id: org.id,
        role: 'admin',
      })
      .select()
      .single<IUser>();

    if (userError || !user) {
      // Rollback: delete auth user and organization
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('organizations').delete().eq('id', org.id);
      throw new BadRequestException(
        `Failed to create user record: ${userError?.message || 'Unknown error'}`,
      );
    }

    return {
      user,
      organization: org,
      message: shouldAutoActivate
        ? 'Account created and activated successfully. You can login now.'
        : 'Account created successfully. Please check your email to verify your account before logging in.',
      email_verified: shouldAutoActivate,
    };
  }

  private async signupWithInvitation(dto: SignupDto): Promise<IAuthResponse> {
    // 1. Validate invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', dto.invitation_token)
      .single<IInvitation>();

    if (inviteError || !invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // 2. Verify email matches invitation
    if (dto.email !== invitation.email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // 3. Create Supabase auth user
    // Auto-confirm email for invitation signups since they have a valid token
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: invitation.email,
        password: dto.password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      throw new BadRequestException(
        `Failed to create user: ${authError?.message || 'Unknown error'}`,
      );
    }

    // 4. Create session to get tokens
    const { data: sessionData, error: sessionError } =
      await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: dto.password,
      });

    if (sessionError || !sessionData.session) {
      throw new BadRequestException('Failed to create session');
    }

    // 5. Create user in application table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        role: invitation.role,
      })
      .select()
      .single<IUser>();

    if (userError || !user) {
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException(
        `Failed to create user record: ${userError?.message || 'Unknown error'}`,
      );
    }

    // 6. Update invitation status
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      user,
    };
  }

  async login(dto: LoginDto): Promise<IAuthResponse> {
    // 1. Sign in with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

    if (authError || !authData.session || !authData.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // CASE 1: Login with invitation token
    if (dto.invitation_token) {
      return await this.loginWithInvitation(dto, authData);
    }

    // CASE 2: Normal login
    // 2. Fetch user from application table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single<IUser>();

    if (userError || !user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user,
    };
  }

  private async loginWithInvitation(
    dto: LoginDto,
    authData: ISupabaseAuthData,
  ): Promise<IAuthResponse> {
    // 1. Validate invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', dto.invitation_token)
      .single<IInvitation>();

    if (inviteError || !invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // 2. Verify email matches invitation
    if (dto.email !== invitation.email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // 3. Create user in application table (add to new organization)
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        role: invitation.role,
      })
      .select()
      .single<IUser>();

    if (userError || !user) {
      throw new BadRequestException(
        `Failed to create user record: ${userError?.message || 'Unknown error'}`,
      );
    }

    // 4. Update invitation status
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      user,
    };
  }

  async getProfile(accessToken: string): Promise<IUser> {
    // 1. Verify JWT token
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      throw new UnauthorizedException('Invalid token');
    }

    // 2. Fetch user from application table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single<IUser>();

    if (userError || !user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
