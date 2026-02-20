'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { PageType, PageContent } from '@babybook/shared';

async function getOwnerContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: member } = await supabase
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .single();

  if (!member || member.role !== 'owner') throw new Error('Not authorized');

  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', member.family_id)
    .single();

  if (!child) throw new Error('No child found');

  return { supabase, familyId: member.family_id, childId: child.id };
}

export async function createPage(
  pageType: PageType,
  pageDate: string,
  content: PageContent,
  templateVariant?: string
) {
  const { supabase, familyId, childId } = await getOwnerContext();

  const { count } = await supabase
    .from('book_pages')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId)
    .is('deleted_at', null);

  const { data: page, error } = await supabase
    .from('book_pages')
    .insert({
      family_id: familyId,
      child_id: childId,
      page_type: pageType,
      template_variant: templateVariant ?? null,
      page_date: pageDate,
      sort_order: count ?? 0,
      status: 'draft',
      content,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/book/[pageId]', 'page');
  revalidatePath('/book/manage');

  return page;
}

export async function updatePage(pageId: string, content: PageContent) {
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('book_pages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', pageId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);

  revalidatePath(`/book/${pageId}`);
  revalidatePath('/book/manage');
}

export async function publishPage(pageId: string) {
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('book_pages')
    .update({ status: 'published' })
    .eq('id', pageId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);

  revalidatePath(`/book/${pageId}`);
  revalidatePath('/book/manage');
}

export async function deletePage(pageId: string) {
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('book_pages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', pageId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);

  revalidatePath('/book/manage');
  redirect('/book');
}

export async function updateSortOrder(pageIds: string[]) {
  const { supabase, familyId } = await getOwnerContext();

  await Promise.all(
    pageIds.map((id, index) =>
      supabase
        .from('book_pages')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('family_id', familyId)
    )
  );

  revalidatePath('/book/manage');
  revalidatePath('/book/[pageId]', 'page');
}

export async function inviteMember(email: string) {
  const { supabase, familyId } = await getOwnerContext();

  const token = crypto.randomUUID();

  const { error } = await supabase
    .from('family_members')
    .insert({
      family_id: familyId,
      email,
      role: 'viewer',
      invite_token: token,
      invite_status: 'pending',
    });

  if (error) throw new Error(error.message);

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;
  return { inviteUrl };
}

export async function updateTheme(themeId: string) {
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('families')
    .update({ theme_id: themeId })
    .eq('id', familyId);

  if (error) throw new Error(error.message);

  revalidatePath('/', 'layout');
}
