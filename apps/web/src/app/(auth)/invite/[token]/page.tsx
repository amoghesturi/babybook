import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { InviteAcceptForm } from './InviteAcceptForm';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  // Look up the invite
  const { data: invite } = await supabase
    .from('family_members')
    .select('id, email, family_id, invite_status')
    .eq('invite_token', token)
    .single();

  if (!invite || invite.invite_status !== 'pending') {
    redirect('/login?message=invalid-invite');
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-3xl font-display text-primary font-bold">You're Invited!</h1>
          <p className="text-text-secondary mt-1">
            You've been invited to view a baby book
          </p>
        </div>
        <div className="bg-surface rounded-2xl shadow-page p-8">
          <InviteAcceptForm token={token} email={invite.email} />
        </div>
      </div>
    </div>
  );
}
