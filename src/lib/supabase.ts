import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { inspectClientEnvironment } from './clientEnv';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const supabaseEnvironment = inspectClientEnvironment({ url: supabaseUrl, anonKey: supabaseAnonKey });

export const isSupabaseConfigured = supabaseEnvironment.configured;

let browserClient: SupabaseClient<Database> | undefined;

/** Returns null when local/Vercel environment variables have not been configured. */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return browserClient;
}

export const SUPABASE_CONFIGURATION_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
