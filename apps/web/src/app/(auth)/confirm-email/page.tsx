import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ConfirmEmailClient } from './ConfirmEmailClient';

export default async function ConfirmEmailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in at all → send to login
  if (!user) redirect('/login');

  // Already confirmed → send them on
  if (user.email_confirmed_at) redirect('/');

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div
        className="w-full max-w-sm rounded-2xl shadow-page p-8"
        style={{ background: 'var(--color-surface)' }}
      >
        <ConfirmEmailClient email={user.email ?? ''} />
      </div>
    </div>
  );
}
