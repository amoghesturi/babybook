'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

  return { supabase, familyId: member.family_id };
}

export async function updateFamilyName(name: string) {
  const { familyId } = await getOwnerContext();
  const admin = getAdminClient();

  const { error } = await admin
    .from('families')
    .update({ name })
    .eq('id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

export async function updateChildDetails(details: {
  name: string;
  dateOfBirth: string;
  gender: string | null;
}) {
  const { supabase, familyId } = await getOwnerContext();
  const admin = getAdminClient();

  const { data: child } = await supabase
    .from('children')
    .select('id')
    .eq('family_id', familyId)
    .single();

  if (!child) throw new Error('No child found');

  const { error } = await admin
    .from('children')
    .update({
      name: details.name,
      date_of_birth: details.dateOfBirth,
      gender: details.gender || null,
    })
    .eq('id', child.id);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

export async function updateCoverPage(data: {
  bookTitle: string;
  subtitle: string;
}) {
  const { supabase, familyId } = await getOwnerContext();
  const admin = getAdminClient();

  const { data: cover } = await supabase
    .from('book_pages')
    .select('id, content')
    .eq('family_id', familyId)
    .eq('page_type', 'cover')
    .is('deleted_at', null)
    .single();

  if (!cover) throw new Error('Cover page not found');

  const { error } = await admin
    .from('book_pages')
    .update({
      content: {
        ...(cover.content as object),
        book_title: data.bookTitle,
        subtitle: data.subtitle,
      },
    })
    .eq('id', cover.id);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
  revalidatePath('/book');
}
