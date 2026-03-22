import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      this.logger.error('Supabase URL or Anon Key not provided');
      throw new Error('Supabase configuration is missing');
    }

    // Create public client (with anon key)
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // Create admin client (with service key) if available
    if (supabaseServiceKey) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    this.logger.log('Supabase client initialized successfully');
  }

  /**
   * Get the public Supabase client (uses anon key)
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (uses service key)
   * Use this for server-side operations that bypass RLS
   */
  getAdminClient(): SupabaseClient {
    if (!this.supabaseAdmin) {
      throw new Error('Supabase admin client not initialized. Service key required.');
    }
    return this.supabaseAdmin;
  }

  /**
   * Create a Supabase client with a user's access token
   * Useful for making requests on behalf of a specific user
   */
  getClientWithAuth(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing');
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    });
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      this.logger.error(`Sign up failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Sign in a user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.error(`Sign in failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Sign out a user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      this.logger.error(`Sign out failed: ${error.message}`);
      throw error;
    }

    return { success: true };
  }

  /**
   * Get user from access token
   */
  async getUser(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error) {
      this.logger.error(`Get user failed: ${error.message}`);
      throw error;
    }

    return data.user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Reset password request
   */
  async resetPasswordForEmail(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.configService.get<string>('APP_URL')}/reset-password`,
    });

    if (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Update user password
   */
  async updatePassword(accessToken: string, newPassword: string) {
    const client = this.getClientWithAuth(accessToken);
    const { data, error } = await client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.logger.error(`Password update failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Database operations example - Query data from a table
   */
  async queryTable(tableName: string, filters?: any) {
    let query = this.supabase.from(tableName).select('*');

    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Query failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Database operations example - Insert data
   */
  async insertData(tableName: string, data: any) {
    const { data: result, error } = await this.supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      this.logger.error(`Insert failed: ${error.message}`);
      throw error;
    }

    return result;
  }

  /**
   * Database operations example - Update data
   */
  async updateData(tableName: string, id: string, updates: any) {
    const { data, error } = await this.supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      this.logger.error(`Update failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Database operations example - Delete data
   */
  async deleteData(tableName: string, id: string) {
    const { error } = await this.supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw error;
    }

    return { success: true };
  }

  /**
   * Storage operations example - Upload file
   */
  async uploadFile(bucket: string, path: string, file: Buffer | Blob, contentType?: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Storage operations example - Get public URL
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Storage operations example - Download file
   */
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      this.logger.error(`File download failed: ${error.message}`);
      throw error;
    }

    return data;
  }

  /**
   * Storage operations example - Delete file
   */
  async deleteFile(bucket: string, paths: string[]) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      throw error;
    }

    return data;
  }
}