import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ManagePages } from '@/components/book/ManagePages';
import type { BookPage } from '@babybook/shared';

export default async function ManagePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'owner') redirect('/book');

  const { data: pages } = await supabase
    .from('book_pages')
    .select('*')
    .eq('family_id', member.family_id)
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true });

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <a href="/book" className="text-text-secondary hover:text-text-primary text-sm transition">
          ← Back to Book
        </a>
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
          Manage Book
        </h1>
        <a
          href="/settings"
          className="text-sm px-3 py-1.5 rounded-lg border transition hover:bg-border/30"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Settings
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ManagePages initialPages={(pages ?? []) as BookPage[]} />
      </main>
    </div>
  );
}
