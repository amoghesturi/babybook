import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from './OnboardingWizard';
import { LogoutButton } from '@/components/ui/LogoutButton';

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
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm">
        <span className="font-display font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
          BabyBook
        </span>
        <LogoutButton />
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        <OnboardingWizard userId={user.id} />
      </div>
    </div>
  );
}
