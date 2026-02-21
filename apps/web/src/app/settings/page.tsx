import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './SettingsClient';
import { LogoutButton } from '@/components/ui/LogoutButton';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'owner') redirect('/book');

  const [
    { data: family },
    { data: members },
    { data: child },
    { data: cover },
  ] = await Promise.all([
    supabase
      .from('families')
      .select('id, name, theme_id')
      .eq('id', member.family_id)
      .single(),
    supabase
      .from('family_members')
      .select('id, email, role, invite_status')
      .eq('family_id', member.family_id)
      .order('created_at'),
    supabase
      .from('children')
      .select('id, name, date_of_birth, gender')
      .eq('family_id', member.family_id)
      .single(),
    supabase
      .from('book_pages')
      .select('id, content')
      .eq('family_id', member.family_id)
      .eq('page_type', 'cover')
      .is('deleted_at', null)
      .single(),
  ]);

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <a href="/book" className="text-text-secondary hover:text-text-primary text-sm transition">
          ← Back to Book
        </a>
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
          Settings
        </h1>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <SettingsClient
          family={family!}
          members={members ?? []}
          currentUserId={user.id}
          child={child ?? null}
          cover={cover ?? null}
        />
      </main>
    </div>
  );
}
