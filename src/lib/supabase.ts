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
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return browserClient;
}

/**
 * Read-only provider health check. Supabase exposes this endpoint publicly;
 * the anon key is used only as the normal Data API credential and is never
 * returned to callers.
 */
export async function isGoogleProviderEnabled(): Promise<boolean | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey!, Authorization: `Bearer ${supabaseAnonKey!}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = await response.json() as { external?: { google?: boolean } };
    return payload.external?.google === true;
  } catch {
    return null;
  }
}

export const SUPABASE_CONFIGURATION_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
