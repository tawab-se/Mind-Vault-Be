import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let supabaseInstance: SupabaseClient | null = null;

// Lazy initialization to ensure env vars are loaded
export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined in environment variables',
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseInstance;
};

// Export singleton instance
export const supabase = getSupabase();
