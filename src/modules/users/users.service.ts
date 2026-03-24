import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../utils/supabase-client';
import { IUser } from '../../common/dto/types';

@Injectable()
export class UsersService {
  async getUsersByOrganization(organizationId: string): Promise<IUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .returns<IUser[]>();

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  async getUserById(userId: string): Promise<IUser> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single<IUser>();

    if (error || !data) {
      throw new NotFoundException('User not found');
    }

    return data;
  }
}
