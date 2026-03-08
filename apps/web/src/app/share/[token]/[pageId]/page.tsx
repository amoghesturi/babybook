import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { PublicBookReader } from '@/components/book/PublicBookReader';
import type { BookPage, NavigationInfo } from '@babybook/shared';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export const metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string; pageId: string }>;
}

export default async function PublicSharePageRoute({ params }: Props) {
  const { token, pageId } = await params;

  const admin = getAdminClient();

  // Validate token and sharing state — single query
  const { data: family } = await admin
    .from('families')
    .select('id, sharing_enabled')
    .eq('share_token', token)
    .single();

  if (!family || !family.sharing_enabled) notFound();

  // Fetch the requested page — must be published and belong to this family
  const { data: page } = await admin
    .from('book_pages')
    .select('*')
    .eq('id', pageId)
    .eq('family_id', family.id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (!page) notFound();

  // All published page IDs for navigation
  const { data: allPages } = await admin
    .from('book_pages')
    .select('id')
    .eq('family_id', family.id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true });

  const pageIds = (allPages ?? []).map((p: { id: string }) => p.id);
  const currentIndex = pageIds.indexOf(pageId);

  const nav: NavigationInfo = {
    prevPageId: currentIndex > 0 ? pageIds[currentIndex - 1] : null,
    nextPageId: currentIndex < pageIds.length - 1 ? pageIds[currentIndex + 1] : null,
    currentIndex,
    totalPages: pageIds.length,
  };

  // Fetch child name and section name in parallel — no DOB exposed in URL
  const [{ data: child }, { data: section }] = await Promise.all([
    admin.from('children').select('name, date_of_birth').eq('id', page.child_id).single(),
    page.section_id
      ? admin.from('book_sections').select('name').eq('id', page.section_id).single()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <PublicBookReader
      page={page as BookPage}
      nav={nav}
      childName={child?.name ?? ''}
      childDob={child?.date_of_birth ?? ''}
      sectionName={section?.name ?? null}
      token={token}
    />
  );
}
