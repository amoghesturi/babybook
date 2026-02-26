'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { SECTION_TYPES } from '@babybook/shared';
import type { SectionType, BookSection } from '@babybook/shared';

const uuidSchema = z.string().uuid('Invalid ID format');
const sectionTypeSchema = z.enum([
  'pregnancy', 'birth', 'newborn_0_3', 'first_6_months', 'second_6_months', 'toddler', 'custom',
]);

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

  const { data: child } = await supabase
    .from('children')
    .select('id, date_of_birth')
    .eq('family_id', member.family_id)
    .single();

  if (!child) throw new Error('No child found');

  return { supabase, familyId: member.family_id, childId: child.id, childDob: child.date_of_birth as string };
}

/** Compute a YYYY-MM string given DOB and a month_offset (1 = first month of life) */
function addMonths(dobStr: string, offset: number): string {
  const dob = new Date(dobStr + 'T12:00:00');
  const year = dob.getFullYear();
  const month = dob.getMonth() + offset; // 0-indexed + offset
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function createSection(
  sectionType: SectionType,
  customName?: string
): Promise<BookSection> {
  sectionTypeSchema.parse(sectionType);
  if (customName !== undefined) z.string().max(200).trim().parse(customName);
  const { supabase, familyId, childId, childDob } = await getOwnerContext();
  const admin = getAdminClient();

  const meta = SECTION_TYPES.find((s) => s.id === sectionType);
  if (!meta) throw new Error('Unknown section type');

  const name = customName?.trim() || meta.label;

  // Determine sort_order: after the last existing section
  const { count } = await supabase
    .from('book_sections')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', familyId);

  const { data: section, error: secError } = await admin
    .from('book_sections')
    .insert({ family_id: familyId, child_id: childId, name, section_type: sectionType, sort_order: count ?? 0 })
    .select()
    .single();

  if (secError) throw new Error(secError.message);

  // Get current max sort_order for pages
  const { data: lastPage } = await supabase
    .from('book_pages')
    .select('sort_order')
    .eq('family_id', familyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  let pageSortOrder = (lastPage?.sort_order ?? -1) + 1;

  // Insert preset pages as drafts
  for (const preset of meta.presetPages) {
    let pageDate: string;
    let content: Record<string, unknown>;

    if (preset.page_type === 'monthly_summary' && preset.month_offset != null) {
      const yearMonth = addMonths(childDob, preset.month_offset);
      pageDate = `${yearMonth}-01`;
      content = { year_month: yearMonth };
    } else if (preset.page_type === 'birth_story') {
      pageDate = childDob;
      content = { date_of_birth: childDob, weight_kg: 0, height_cm: 0 };
    } else {
      pageDate = new Date().toISOString().split('T')[0];
      content = { title: preset.description, content_tiptap: { type: 'doc', content: [{ type: 'paragraph' }] } };
    }

    await admin.from('book_pages').insert({
      family_id: familyId,
      child_id: childId,
      page_type: preset.page_type,
      page_date: pageDate,
      sort_order: pageSortOrder++,
      status: 'draft',
      content,
      section_id: section.id,
    });
  }

  revalidatePath('/book/manage');
  return section as BookSection;
}

export async function renameSection(sectionId: string, name: string): Promise<void> {
  uuidSchema.parse(sectionId);
  z.string().min(1, 'Name is required').max(200).parse(name);
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('book_sections')
    .update({ name: name.trim() })
    .eq('id', sectionId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/book/manage');
}

export async function deleteSection(sectionId: string): Promise<void> {
  uuidSchema.parse(sectionId);
  const { familyId } = await getOwnerContext();
  const admin = getAdminClient();

  // Pages remain (section_id SET NULL via FK on delete set null)
  const { error } = await admin
    .from('book_sections')
    .delete()
    .eq('id', sectionId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/book/manage');
}

export async function movePageToSection(
  pageId: string,
  sectionId: string | null
): Promise<void> {
  uuidSchema.parse(pageId);
  if (sectionId !== null) uuidSchema.parse(sectionId);
  const { supabase, familyId } = await getOwnerContext();

  const { error } = await supabase
    .from('book_pages')
    .update({ section_id: sectionId })
    .eq('id', pageId)
    .eq('family_id', familyId);

  if (error) throw new Error(error.message);
  revalidatePath('/book/manage');
}

export async function updateSectionSortOrder(sectionIds: string[]): Promise<void> {
  const { supabase, familyId } = await getOwnerContext();

  await Promise.all(
    sectionIds.map((id, i) =>
      supabase
        .from('book_sections')
        .update({ sort_order: i })
        .eq('id', id)
        .eq('family_id', familyId)
    )
  );

  revalidatePath('/book/manage');
}
