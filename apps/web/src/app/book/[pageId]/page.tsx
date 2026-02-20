import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { BookReader } from '@/components/book/BookReader';
import type { BookPage, NavigationInfo } from '@babybook/shared';

interface Props {
  params: Promise<{ pageId: string }>;
}

export default async function BookPageRoute({ params }: Props) {
  const { pageId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: member } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single();

  if (!member) redirect('/onboarding');

  const isOwner = member.role === 'owner';

  // Fetch the current page
  const { data: page } = await supabase
    .from('book_pages')
    .select('*')
    .eq('id', pageId)
    .eq('family_id', member.family_id)
    .is('deleted_at', null)
    .single();

  if (!page) notFound();

  // Viewers can't see drafts
  if (!isOwner && page.status === 'draft') notFound();

  // Fetch all visible page IDs for navigation
  let pagesQuery = supabase
    .from('book_pages')
    .select('id')
    .eq('family_id', member.family_id)
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true });

  if (!isOwner) {
    pagesQuery = pagesQuery.eq('status', 'published');
  }

  const { data: allPages } = await pagesQuery;
  const pageIds = (allPages ?? []).map((p: { id: string }) => p.id);
  const currentIndex = pageIds.indexOf(pageId);

  const nav: NavigationInfo = {
    prevPageId: currentIndex > 0 ? pageIds[currentIndex - 1] : null,
    nextPageId: currentIndex < pageIds.length - 1 ? pageIds[currentIndex + 1] : null,
    currentIndex,
    totalPages: pageIds.length,
  };

  // Fetch child info
  const { data: child } = await supabase
    .from('children')
    .select('name, date_of_birth')
    .eq('id', page.child_id)
    .single();

  return (
    <BookReader
      page={page as BookPage}
      nav={nav}
      isOwner={isOwner}
      childName={child?.name ?? ''}
      childDob={child?.date_of_birth ?? ''}
    />
  );
}
