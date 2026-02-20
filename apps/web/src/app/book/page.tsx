import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function BookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: member } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    redirect('/onboarding');
  }

  // Get first published page ordered by page_date + sort_order
  const { data: firstPage } = await supabase
    .from('book_pages')
    .select('id')
    .eq('family_id', member.family_id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  if (!firstPage) {
    // No pages yet; redirect to onboarding or show empty state
    redirect('/onboarding');
  }

  redirect(`/book/${firstPage.id}`);
}
