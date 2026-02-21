'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { DEFAULT_THEME_ID } from '@babybook/shared';

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface OnboardingData {
  familyName: string;
  childName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  bookTitle: string;
  subtitle: string;
  themeId: string;
}

export async function completeOnboarding(data: OnboardingData) {
  // Auth check with anon client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Double-check not already onboarded
  const { data: existing } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', user.id)
    .single();
  if (existing) redirect('/book');

  // Use service role to bypass RLS for initial setup
  const admin = getAdminClient();

  // 1. Create family
  const { data: family, error: familyErr } = await admin
    .from('families')
    .insert({ name: data.familyName, theme_id: data.themeId || DEFAULT_THEME_ID })
    .select()
    .single();
  if (familyErr) throw new Error(familyErr.message);

  // 2. Add owner member record
  const { error: memberErr } = await admin
    .from('family_members')
    .insert({
      family_id: family.id,
      user_id: user.id,
      email: user.email ?? '',
      role: 'owner',
      invite_status: 'accepted',
    });
  if (memberErr) throw new Error(memberErr.message);

  // 3. Create child
  const { data: child, error: childErr } = await admin
    .from('children')
    .insert({
      family_id: family.id,
      name: data.childName,
      date_of_birth: data.dateOfBirth,
      gender: data.gender || null,
    })
    .select()
    .single();
  if (childErr) throw new Error(childErr.message);

  // 4. Create cover page
  const { data: coverPage, error: coverErr } = await admin
    .from('book_pages')
    .insert({
      family_id: family.id,
      child_id: child.id,
      page_type: 'cover',
      page_date: data.dateOfBirth,
      sort_order: 0,
      status: 'published',
      content: {
        book_title: data.bookTitle || `${data.childName}'s Baby Book`,
        subtitle: data.subtitle || `The story of ${data.childName}`,
      },
    })
    .select()
    .single();
  if (coverErr) throw new Error(coverErr.message);

  redirect(`/book/${coverPage.id}`);
}
