import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { inspectClientEnvironment } from './clientEnv';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const supabaseEnvironment = inspectClientEnvironment({ url: supabaseUrl, anonKey: supabaseAnonKey });

export const isSupabaseConfigured = supabaseEnvironment.configured;

let browserClient: SupabaseClient<Database> | undefined;
const GOOGLE_PROVIDER_CHECK_TIMEOUT_MS = 4_000;

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
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GOOGLE_PROVIDER_CHECK_TIMEOUT_MS);
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey!, Authorization: `Bearer ${supabaseAnonKey!}` },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const payload = await response.json() as { external?: { google?: boolean } };
    return payload.external?.google === true;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const SUPABASE_CONFIGURATION_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
