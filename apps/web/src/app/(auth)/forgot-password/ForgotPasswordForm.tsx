'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="text-5xl">📨</div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Check your inbox
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            We sent a password reset link to
          </p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {email}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Click the link to set a new password. It expires in 1 hour.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
          placeholder="you@example.com"
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
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-center text-sm pt-1" style={{ color: 'var(--color-text-secondary)' }}>
        Remember your password?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
          Sign in →
        </Link>
      </p>
    </form>
  );
}
