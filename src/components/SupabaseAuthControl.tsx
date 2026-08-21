import type { SupabaseAuthState } from '../hooks/useSupabaseAuth';

interface Props { auth: SupabaseAuthState; }

/** Compact header control; render it wherever the application header is composed. */
export function SupabaseAuthControl({ auth }: Props) {
  if (auth.loading) return <span className="text-xs text-neutral-500">Checking access…</span>;
  if (!auth.session) return <button onClick={() => void auth.signInWithGoogle()} className="rounded-xl border border-blue-700 bg-blue-950 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900">Sign in with Google</button>;
  return <div className="flex items-center gap-2 text-xs"><span className={auth.isStaff ? 'rounded-lg border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-300' : 'rounded-lg border border-neutral-700 px-2 py-1 text-neutral-400'}>{auth.isStaff ? `${auth.role} access` : 'read-only'}</span><button onClick={() => void auth.signOut()} className="text-neutral-400 hover:text-neutral-100">Sign out</button></div>;
}
