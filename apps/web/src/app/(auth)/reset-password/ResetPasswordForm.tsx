'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Supabase sends the recovery token in the URL hash; the client lib
  // picks it up automatically via onAuthStateChange when the session
  // transitions to PASSWORD_RECOVERY.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  }

  if (!ready) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="text-4xl">🔗</div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Verifying your reset link…
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          If nothing happens, the link may have expired.{' '}
          <a href="/forgot-password" className="underline" style={{ color: 'var(--color-primary)' }}>
            Request a new one
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          New password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoFocus
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="w-full px-4 py-3 border rounded-xl text-sm transition"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
        <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Minimum 8 characters
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 mt-2"
        style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
      >
        {loading ? 'Updating password…' : 'Set new password'}
      </button>
    </form>
  );
}
