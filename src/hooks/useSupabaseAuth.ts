import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchStaffRole } from '../data/supabaseCatalogRepository';
import { getSupabaseBrowserClient, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';

export type StaffRole = 'staff' | 'admin' | null;
export interface SupabaseAuthState {
  session: Session | null;
  role: StaffRole;
  loading: boolean;
  error: string | null;
  isStaff: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<StaffRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      const task = window.setTimeout(() => { setError(SUPABASE_CONFIGURATION_ERROR); setLoading(false); }, 0);
      return () => window.clearTimeout(task);
    }
    let active = true;
    const applySession = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setRole(nextSession ? await fetchStaffRole(client, nextSession.user.id) : null);
      if (active) setLoading(false);
    };
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError && active) setError(sessionError.message);
      return applySession(data.session);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => { void applySession(nextSession); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) { setError(SUPABASE_CONFIGURATION_ERROR); return; }
    setError(null);
    const { error: authError } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (authError) setError(authError.message);
  }, []);
  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) { setError(SUPABASE_CONFIGURATION_ERROR); return; }
    setError(null);
    const { error: authError } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) setError(authError.message);
  }, []);
  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { error: authError } = await client.auth.signOut();
    if (authError) setError(authError.message);
  }, []);
  return { session, role, loading, error, isStaff: role !== null, signInWithGoogle, signInWithPassword, signOut };
}
