import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from './OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // If already onboarded, redirect to book
  const { data: member } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  if (member) {
    redirect('/book');
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--color-background)' }}>
      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <OnboardingWizard userId={user.id} />
      </div>
    </div>
  );
}
