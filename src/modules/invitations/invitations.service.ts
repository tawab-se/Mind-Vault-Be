import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { supabase } from '../../utils/supabase-client';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import {
  IInvitation,
  IUser,
  IOrganization,
  ICreateInvitationResponse,
  IValidateInvitationResponse,
} from '../../common/dto/types';
import { randomBytes } from 'crypto';
import { EmailService } from '../../utils/email.service';

@Injectable()
export class InvitationsService {
  async createInvitation(
    currentUserId: string,
    dto: CreateInvitationDto,
  ): Promise<ICreateInvitationResponse> {
    // 1. Get current user to verify they're an admin
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUserId)
      .single<IUser>();

    if (userError || !currentUser) {
      throw new UnauthorizedException('User not found');
    }

    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can invite users');
    }

    // 2. Generate unique token
    const token = randomBytes(32).toString('hex');

    // 3. Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        email: dto.email,
        organization_id: currentUser.organization_id,
        role: dto.role,
        token,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single<IInvitation>();

    if (inviteError || !invitation) {
      throw new BadRequestException(
        `Failed to create invitation: ${inviteError?.message || 'Unknown error'}`,
      );
    }

    // 5. Get organization details for email
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', currentUser.organization_id)
      .single<IOrganization>();

    // 6. Send invitation email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/auth/accept-invite?token=${token}`;

    await EmailService.sendInvitationEmail({
      to: dto.email,
      inviterName: currentUser.email,
      organizationName: organization?.name || 'the organization',
      inviteToken: token,
      role: dto.role,
    });

    return {
      invitation,
      inviteLink,
    };
  }

  async acceptInvitation(
    accessToken: string,
    dto: AcceptInvitationDto,
  ): Promise<IUser> {
    // 1. Verify Supabase user from JWT
    const { data: authData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      throw new UnauthorizedException('Invalid token');
    }

    // 2. Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', dto.token)
      .single<IInvitation>();

    if (inviteError || !invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // 3. Validate invitation
    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation has already been used');
    }

    if (new Date(invitation.expires_at) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // 3.5. Get user's first_name and last_name from existing record
    const { data: existingUser } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', authData.user.id)
      .limit(1)
      .single<Pick<IUser, 'first_name' | 'last_name'>>();

    // 4. Create user in application table
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: invitation.email,
        first_name: existingUser?.first_name,
        last_name: existingUser?.last_name,
        organization_id: invitation.organization_id,
        role: invitation.role,
      })
      .select()
      .single<IUser>();

    if (userError || !user) {
      throw new BadRequestException(
        `Failed to create user: ${userError?.message || 'Unknown error'}`,
      );
    }

    // 5. Update invitation status
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    return user;
  }

  async validateInvitation(
    token: string,
  ): Promise<IValidateInvitationResponse> {
    // 1. Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single<IInvitation>();

    if (inviteError || !invitation) {
      return {
        valid: false,
        user_exists: false,
        action_required: null,
        message: 'Invitation not found',
      };
    }

    // 2. Check if invitation is already used
    if (invitation.status !== 'pending') {
      return {
        valid: false,
        user_exists: false,
        action_required: null,
        message: 'This invitation has already been used',
      };
    }

    // 3. Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return {
        valid: false,
        user_exists: false,
        action_required: null,
        message: 'This invitation has expired',
      };
    }

    // 4. Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', invitation.organization_id)
      .single<IOrganization>();

    // 5. Check if user already exists in Supabase auth
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const userExists =
      authUsers?.users?.some((user) => user.email === invitation.email) ||
      false;

    return {
      valid: true,
      invitation: {
        email: invitation.email,
        organization_name: organization?.name || 'Unknown Organization',
        role: invitation.role,
        expires_at: invitation.expires_at,
      },
      user_exists: userExists,
      action_required: userExists ? 'login' : 'signup',
      message: userExists
        ? 'Please login to accept this invitation'
        : 'Please create your account to accept this invitation',
    };
  }

  async getInvitationsByOrganization(
    organizationId: string,
  ): Promise<IInvitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .returns<IInvitation[]>();

    if (error) {
      throw new BadRequestException(
        `Failed to fetch invitations: ${error.message}`,
      );
    }

    return data || [];
  }
}
