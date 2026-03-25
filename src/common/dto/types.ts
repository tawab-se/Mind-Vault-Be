export type Role = 'admin' | 'member';

export interface IUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  organization_id: string;
  role: Role;
  created_at: string;
}

export interface IOrganization {
  id: string;
  name: string;
  created_at: string;
}

export interface IInvitation {
  id: string;
  email: string;
  organization_id: string;
  role: Role;
  token: string;
  status: 'pending' | 'accepted';
  expires_at: string;
  created_at: string;
}

// Auth response types
export interface IAuthResponse {
  access_token: string;
  refresh_token: string;
  user: IUser;
}

export interface ISupabaseAuthData {
  user: { id: string };
  session: { access_token: string; refresh_token: string };
}

export interface ISignupResponse {
  user: IUser;
  organization: IOrganization;
  message: string;
  email_verified: boolean;
}

// Invitation response types
export interface ICreateInvitationResponse {
  invitation: IInvitation;
  inviteLink: string;
}

export interface IValidateInvitationResponse {
  valid: boolean;
  invitation?: {
    email: string;
    organization_name: string;
    role: string;
    expires_at: string;
  };
  user_exists: boolean;
  action_required: 'signup' | 'login' | null;
  message?: string;
}
