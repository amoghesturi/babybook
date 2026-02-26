'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // Email confirmations disabled — user is immediately signed in
      router.push('/onboarding');
    } else {
      // Confirmation email sent — show "check your email"
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="text-5xl">📬</div>
        <div>
          <h3 className="font-display font-semibold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Check your inbox
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            We sent a confirmation link to
          </p>
          <p className="font-semibold text-sm mt-0.5" style={{ color: 'var(--color-text-primary)' }}>
            {email}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Click the link to activate your account and start your baby book.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
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
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="text-center text-sm pt-1" style={{ color: 'var(--color-text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
          Sign in →
        </Link>
      </p>
    </form>
  );
}
