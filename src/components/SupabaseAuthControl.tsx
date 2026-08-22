import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { SupabaseAuthState } from '../hooks/useSupabaseAuth';
import { authCredentialsSchema, registrationSchema } from '../validation/authSchemas';

interface Props { auth: SupabaseAuthState; }
type AuthMode = 'login' | 'register';

function firstValidationMessage(result: { success: boolean; error?: { issues: Array<{ message: string }> } }): string | null {
  return result.success ? null : result.error?.issues[0]?.message ?? 'Check the form and try again.';
}

/** Header auth control with a full email/password form and Google OAuth option. */
export function SupabaseAuthControl({ auth }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (auth.loading) return <span className="text-xs text-neutral-500">Checking access…</span>;

  if (auth.session) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className={auth.isStaff ? 'rounded-lg border border-emerald-700 bg-emerald-950 px-2 py-1 text-emerald-300' : 'rounded-lg border border-neutral-700 px-2 py-1 text-neutral-400'}>
          {auth.isStaff ? `${auth.role} access` : 'read-only'}
        </span>
        <span className="hidden max-w-40 truncate text-neutral-500 sm:inline" title={auth.session.user.email ?? undefined}>
          {auth.session.user.email}
        </span>
        <button type="button" onClick={() => void auth.signOut()} className="text-neutral-400 hover:text-neutral-100">Sign out</button>
      </div>
    );
  }

  const open = (nextMode: AuthMode) => {
    setMode(nextMode);
    setNotice(null);
    setFormError(null);
    auth.clearError();
    setIsOpen(true);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setFormError(null);
    const result = mode === 'login'
      ? authCredentialsSchema.safeParse({ email, password })
      : registrationSchema.safeParse({ email, password, confirmPassword });
    const validationMessage = firstValidationMessage(result);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await auth.signInWithPassword(email, password);
      } else {
        const signUpResult = await auth.signUpWithPassword(email, password);
        if (signUpResult.confirmationRequired) {
          setNotice('Account created. Check your email to confirm the account, then sign in.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const googleDisabled = auth.googleConfigured !== true;

  return (
    <>
      <button type="button" onClick={() => open('login')} className="rounded-lg border border-red-800 bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-900">
        Sign in / Register
      </button>

      {!isOpen ? null : (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" className="tech-panel w-full max-w-md rounded-xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="auth-dialog-title" className="text-lg font-bold text-neutral-100">{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
                <p className="mt-1 text-xs text-neutral-400">Use your email or continue with Google.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-2 py-1 text-lg text-neutral-500 hover:bg-neutral-800 hover:text-red-200" aria-label="Close">×</button>
            </div>

            <button
              type="button"
              onClick={() => void auth.signInWithGoogle()}
              disabled={googleDisabled}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-600 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              <span className="text-base font-bold">G</span>
              {auth.googleConfigured === false ? 'Google is not enabled' : auth.googleConfigured === null ? 'Checking Google…' : 'Continue with Google'}
            </button>
            {auth.googleConfigured === false && <p className="mt-2 text-center text-[11px] text-amber-300">Enable Google in Supabase Authentication → Providers to use this option.</p>}

            <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-neutral-600"><span className="h-px flex-1 bg-neutral-800" />or use email<span className="h-px flex-1 bg-neutral-800" /></div>

            <form onSubmit={(event) => void submit(event)} className="space-y-3">
              <label className="block text-xs text-neutral-300">Email
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="tech-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm text-neutral-100 outline-none" autoComplete="email" placeholder="you@example.com" />
              </label>
              <label className="block text-xs text-neutral-300">Password
                <input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="tech-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm text-neutral-100 outline-none" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" />
              </label>
              {mode === 'register' && <label className="block text-xs text-neutral-300">Confirm password
                <input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="tech-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm text-neutral-100 outline-none" autoComplete="new-password" />
              </label>}

              {(formError || auth.error) && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/60 px-3 py-2 text-xs text-red-200">{formError || auth.error}</p>}
              {notice && <p role="status" className="rounded-xl border border-emerald-900 bg-emerald-950/60 px-3 py-2 text-xs text-emerald-200">{notice}</p>}

              <button type="submit" disabled={submitting} className="tech-red-button w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
                {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-neutral-400">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => open(mode === 'login' ? 'register' : 'login')} className="font-semibold text-red-300 hover:text-red-200">
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </section>
        </div>
      )}
    </>
  );
}
