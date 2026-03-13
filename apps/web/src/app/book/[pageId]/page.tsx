import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/getUser';
import { notFound, redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { BookReader } from '@/components/book/BookReader';
import type { BookPage, NavigationInfo } from '@babybook/shared';

interface Props {
  params: Promise<{ pageId: string }>;
}

const getChildInfo = unstable_cache(
  async (childId: string) => {
    const supabase = await createClient();
    return supabase
      .from('children')
      .select('name, date_of_birth')
      .eq('id', childId)
      .single();
  },
  ['child-info'],
  { revalidate: 3600, tags: ['child-info'] }
);

const getSectionName = unstable_cache(
  async (sectionId: string) => {
    const supabase = await createClient();
    return supabase
      .from('book_sections')
      .select('name')
      .eq('id', sectionId)
      .single();
  },
  ['section-name'],
  { revalidate: 3600, tags: ['section-name'] }
);

export default async function BookPageRoute({ params }: Props) {
  const { pageId } = await params;
  const supabase = await createClient();

  // Step 1: auth (deduped via React.cache — middleware already called this)
  const { data: { user } } = await getUser();
  if (!user) redirect('/login');

  // Step 2: member + current page in parallel
  const [{ data: member }, { data: page }] = await Promise.all([
    supabase
      .from('family_members')
      .select('family_id, role')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('book_pages')
      .select('*')
      .eq('id', pageId)
      .is('deleted_at', null)
      .single(),
  ]);

  if (!member) redirect('/onboarding');
  if (!page || page.family_id !== member.family_id) notFound();

  const isOwner = member.role === 'owner';

  // Viewers can't see drafts
  if (!isOwner && page.status === 'draft') notFound();

  const { family_id } = member;
  const { page_date, sort_order, child_id, section_id } = page;

  // Step 3: prev, next, total count, current index, child info, section name — all in parallel
  const prevBase = supabase
    .from('book_pages')
    .select('id')
    .eq('family_id', family_id)
    .is('deleted_at', null)
    .or(`page_date.lt.${page_date},and(page_date.eq.${page_date},sort_order.lt.${sort_order})`)
    .order('page_date', { ascending: false })
    .order('sort_order', { ascending: false })
    .limit(1);
  const prevQuery = isOwner ? prevBase : prevBase.eq('status', 'published');

  const nextBase = supabase
    .from('book_pages')
    .select('id')
    .eq('family_id', family_id)
    .is('deleted_at', null)
    .or(`page_date.gt.${page_date},and(page_date.eq.${page_date},sort_order.gt.${sort_order})`)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true })
    .limit(1);
  const nextQuery = isOwner ? nextBase : nextBase.eq('status', 'published');

  const totalBase = supabase
    .from('book_pages')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', family_id)
    .is('deleted_at', null);
  const totalQuery = isOwner ? totalBase : totalBase.eq('status', 'published');

  const indexBase = supabase
    .from('book_pages')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', family_id)
    .is('deleted_at', null)
    .or(`page_date.lt.${page_date},and(page_date.eq.${page_date},sort_order.lt.${sort_order})`);
  const indexQuery = isOwner ? indexBase : indexBase.eq('status', 'published');

  const [
    { data: prevRows },
    { data: nextRows },
    { count: totalPages },
    { count: currentIndex },
    { data: child },
    { data: section },
  ] = await Promise.all([
    prevQuery,
    nextQuery,
    totalQuery,
    indexQuery,
    getChildInfo(child_id),
    section_id
      ? getSectionName(section_id)
      : Promise.resolve({ data: null }),
  ]);

  const prevPageId = prevRows?.[0]?.id ?? null;
  const nextPageId = nextRows?.[0]?.id ?? null;
  const isLastPage = nextPageId === null;

  const nav: NavigationInfo = {
    prevPageId,
    nextPageId: nextPageId ?? (isLastPage ? 'growth' : null),
    currentIndex: currentIndex ?? 0,
    totalPages: totalPages ?? 0,
  };

  return (
    <BookReader
      page={page as BookPage}
      nav={nav}
      isOwner={isOwner}
      childName={child?.name ?? ''}
      childDob={child?.date_of_birth ?? ''}
      sectionName={section?.name ?? null}
    />
  );
}
