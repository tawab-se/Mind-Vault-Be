import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../utils/supabase-client';
import { IOrganization } from '../../common/dto/types';

@Injectable()
export class OrganizationsService {
  async getOrganization(organizationId: string): Promise<IOrganization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single<IOrganization>();

    if (error || !data) {
      throw new NotFoundException('Organization not found');
    }

    return data;
  }
}
