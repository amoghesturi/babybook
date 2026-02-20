'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  token: string;
  email: string;
}

export function InviteAcceptForm({ token, email }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Sign up with the pre-filled email
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Update family_members record to link user_id and mark accepted
      const { error: updateError } = await supabase
        .from('family_members')
        .update({
          user_id: data.user.id,
          invite_status: 'accepted',
          invite_token: null,
        })
        .eq('invite_token', token);

      if (updateError) {
        setError('Failed to accept invite. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/book');
    }
  }

  return (
    <form onSubmit={handleAccept} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Email (from invite)
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-background/50 text-text-secondary cursor-not-allowed"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          Create a Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          placeholder="At least 8 characters"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition disabled:opacity-60"
      >
        {loading ? 'Accepting invite…' : 'Accept Invite & View Book'}
      </button>
    </form>
  );
}
