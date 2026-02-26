'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ConfirmEmailClient({ email }: { email: string }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleResend() {
    setResending(true);
    setError(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    });
    if (error) {
      setError(error.message);
    } else {
      setResent(true);
    }
    setResending(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="text-center space-y-6">
      <div className="text-5xl">📬</div>

      <div className="space-y-2">
        <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Confirm your email
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          We sent a confirmation link to
        </p>
        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {email}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Click the link to activate your account before signing in.
        </p>
      </div>

      {resent && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary-dark)',
            border: '1px solid var(--color-primary-light)',
          }}
        >
          Confirmation email resent — check your inbox.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}
        >
          {resending ? 'Sending…' : resent ? 'Email sent ✓' : 'Resend confirmation email'}
        </button>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-2.5 border rounded-xl text-sm font-medium transition hover:bg-border/30 disabled:opacity-60"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Using local dev? Check{' '}
          <a
            href="http://127.0.0.1:54324"
            target="_blank"
            rel="noreferrer"
            className="underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Mailpit
          </a>{' '}
          for the confirmation email.
        </p>
      )}
    </div>
  );
}
