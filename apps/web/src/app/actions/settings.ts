'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
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

  return { supabase, familyId: member.family_id, userId: user.id };
}

export async function updateFamilyName(name: string) {
  const { name: validName } = z.object({ name: z.string().min(1, 'Family name is required').max(200).trim() }).parse({ name });
  const { familyId } = await getOwnerContext();
  const admin = getAdminClient();

  const { error } = await admin
    .from('families')
    .update({ name: validName })
    .eq('id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

const childDetailsSchema = z.object({
  name: z.string().min(1, 'Baby name is required').max(200).trim(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  gender: z.enum(['male', 'female', 'other']).nullable(),
});

export async function updateChildDetails(details: {
  name: string;
  dateOfBirth: string;
  gender: string | null;
}) {
  const validated = childDetailsSchema.parse(details);
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
      name: validated.name,
      date_of_birth: validated.dateOfBirth,
      gender: validated.gender,
    })
    .eq('id', child.id);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

const coverPageSchema = z.object({
  bookTitle: z.string().max(300).trim(),
  subtitle: z.string().max(300).trim(),
});

export async function updateCoverPage(data: {
  bookTitle: string;
  subtitle: string;
}) {
  const validated = coverPageSchema.parse(data);
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
        book_title: validated.bookTitle,
        subtitle: validated.subtitle,
      },
    })
    .eq('id', cover.id);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
  revalidatePath('/book');
}

export async function updateMemberRole(memberId: string, role: 'owner' | 'viewer') {
  z.string().uuid('Invalid member ID').parse(memberId);
  z.enum(['owner', 'viewer']).parse(role);

  const { supabase, familyId, userId } = await getOwnerContext();
  const admin = getAdminClient();

  // Fetch the target member to verify they belong to the same family
  const { data: target } = await supabase
    .from('family_members')
    .select('id, user_id')
    .eq('id', memberId)
    .eq('family_id', familyId)
    .single();

  if (!target) throw new Error('Member not found');
  if (target.user_id === userId) throw new Error('You cannot change your own role');

  const { error } = await admin
    .from('family_members')
    .update({ role })
    .eq('id', memberId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}
