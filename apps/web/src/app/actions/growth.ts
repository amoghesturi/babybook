'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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

const logMeasurementSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    weight_kg: z.number().positive().optional(),
    height_cm: z.number().positive().optional(),
    head_circumference_cm: z.number().positive().optional(),
  })
  .refine(
    (d) => d.weight_kg != null || d.height_cm != null || d.head_circumference_cm != null,
    { message: 'At least one measurement is required' }
  );

export async function logMeasurement(
  date: string,
  weight_kg?: number,
  height_cm?: number,
  head_circumference_cm?: number,
): Promise<void> {
  logMeasurementSchema.parse({ date, weight_kg, height_cm, head_circumference_cm });

  const { supabase, familyId, childId } = await getOwnerContext();

  const { error } = await supabase
    .from('growth_measurements')
    .insert({
      family_id: familyId,
      child_id: childId,
      measured_at: date,
      ...(weight_kg != null && { weight_kg }),
      ...(height_cm != null && { height_cm }),
      ...(head_circumference_cm != null && { head_circumference_cm }),
    });

  if (error) throw new Error(error.message);

  revalidatePath('/book/growth');
}
