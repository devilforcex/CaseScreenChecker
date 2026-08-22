import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { fetchStaffRole } from '../data/supabaseCatalogRepository';
import { getSupabaseBrowserClient, isGoogleProviderEnabled, SUPABASE_CONFIGURATION_ERROR } from '../lib/supabase';

export type StaffRole = 'staff' | 'admin' | null;
export interface SupabaseAuthState {
  session: Session | null;
  role: StaffRole;
  loading: boolean;
  error: string | null;
  isStaff: boolean;
  googleConfigured: boolean | null;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useSupabaseAuth(): SupabaseAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<StaffRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
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
    void isGoogleProviderEnabled().then((enabled) => {
      if (active) setGoogleConfigured(enabled);
    });
    const callbackParams = new URLSearchParams(window.location.search);
    const callbackCode = callbackParams.get('code');
    const callbackError = callbackParams.get('error_description') || callbackParams.get('error');
    const requestedNext = callbackParams.get('next');
    const safeNext = requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/';
    const callbackErrorTask = callbackError ? window.setTimeout(() => {
      if (active) setError(`Google sign-in could not be completed: ${callbackError}`);
    }, 0) : undefined;
    if (callbackError) {
      window.history.replaceState({}, document.title, `${window.location.origin}/`);
    }
    const exchangeCode = callbackCode
      ? client.auth.exchangeCodeForSession(callbackCode).then(({ error: exchangeError }) => {
        if (exchangeError && active) setError(`Google sign-in could not be completed: ${exchangeError.message}`);
        if (active && !exchangeError) window.history.replaceState({}, document.title, `${window.location.origin}${safeNext}`);
      })
      : Promise.resolve();
    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError && active) setError(sessionError.message);
      return exchangeCode.then(() => client.auth.getSession()).then(({ data: exchanged }) => applySession(exchanged.session ?? data.session));
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => { void applySession(nextSession); });
    return () => {
      active = false;
      if (callbackErrorTask) window.clearTimeout(callbackErrorTask);
      listener.subscription.unsubscribe();
    };
  }, []);
  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) { setError(SUPABASE_CONFIGURATION_ERROR); return; }
    setError(null);
    if (googleConfigured !== true) {
      setError(googleConfigured === false
        ? 'Google sign-in is not enabled in Supabase yet. Use Administrator login or configure the Google provider first.'
        : 'Google sign-in configuration is still being checked. Retry in a moment.');
      return;
    }
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', `${window.location.pathname}${window.location.search}`);
    const { error: authError } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
    if (authError) setError(authError.message);
  }, [googleConfigured]);
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
  return { session, role, loading, error, googleConfigured, isStaff: role !== null, signInWithGoogle, signInWithPassword, signOut };
}
