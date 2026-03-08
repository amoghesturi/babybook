import { notFound, redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

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
  params: Promise<{ token: string }>;
}

export default async function PublicShareIndexPage({ params }: Props) {
  const { token } = await params;

  const admin = getAdminClient();

  const { data: family } = await admin
    .from('families')
    .select('id, sharing_enabled')
    .eq('share_token', token)
    .single();

  if (!family || !family.sharing_enabled) notFound();

  const { data: firstPage } = await admin
    .from('book_pages')
    .select('id')
    .eq('family_id', family.id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true })
    .limit(1)
    .single();

  if (!firstPage) notFound();

  redirect(`/share/${token}/${firstPage.id}`);
}
