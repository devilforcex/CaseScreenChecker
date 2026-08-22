import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseAuthState } from '../hooks/useSupabaseAuth';

interface Props { auth: SupabaseAuthState; }

/** Compact header control; render it wherever the application header is composed. */
export function SupabaseAuthControl({ auth }: Props) {
  const [passwordLoginOpen, setPasswordLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (auth.loading) return <span className="text-xs text-neutral-500">Checking access…</span>;
  if (!auth.session) {
    const submitPasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitting(true);
      try {
        await auth.signInWithPassword(email, password);
      } finally {
        setSubmitting(false);
      }
    };
    return (
      <div className="relative flex items-center gap-2">
        <button
          onClick={() => void auth.signInWithGoogle()}
          disabled={auth.googleConfigured !== true}
          title={auth.googleConfigured === false ? 'Google provider is not enabled in Supabase' : undefined}
          className="rounded-xl border border-blue-700 bg-blue-950 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900 disabled:cursor-not-allowed disabled:border-neutral-700 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {auth.googleConfigured === false ? 'Google unavailable' : auth.googleConfigured === null ? 'Checking Google…' : 'Sign in with Google'}
        </button>
        <button type="button" onClick={() => setPasswordLoginOpen((open) => !open)} className="rounded-xl border border-neutral-700 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800">Administrator login</button>
        {auth.error && !passwordLoginOpen && <p role="alert" className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-red-900 bg-red-950/95 p-2 text-[11px] text-red-200 shadow-xl">{auth.error}</p>}
        {passwordLoginOpen && (
          <form onSubmit={(event) => void submitPasswordLogin(event)} className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-2xl">
            <label className="block text-[11px] text-neutral-400">Email
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500" autoComplete="username" />
            </label>
            <label className="mt-2 block text-[11px] text-neutral-400">Password
              <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500" autoComplete="current-password" />
            </label>
            {auth.error && <p role="alert" className="mt-2 text-[11px] text-red-300">{auth.error}</p>}
            <button type="submit" disabled={submitting} className="mt-3 w-full rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Signing in…' : 'Sign in'}</button>
          </form>
        )}
      </div>
    );
  }
  return <div className="flex items-center gap-2 text-xs"><span className={auth.isStaff ? 'rounded-lg border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-300' : 'rounded-lg border border-neutral-700 px-2 py-1 text-neutral-400'}>{auth.isStaff ? `${auth.role} access` : 'read-only'}</span><button onClick={() => void auth.signOut()} className="text-neutral-400 hover:text-neutral-100">Sign out</button></div>;
}
