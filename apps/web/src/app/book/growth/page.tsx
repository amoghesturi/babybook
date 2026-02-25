import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GrowthChartClient } from './GrowthChartClient';
import { LogoutButton } from '@/components/ui/LogoutButton';
import type { GrowthDataPoint, BirthStoryContent, MonthlySummaryContent } from '@babybook/shared';

export default async function GrowthPage() {
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

  // Fetch child DOB
  let childQuery = supabase
    .from('children')
    .select('name, date_of_birth')
    .eq('family_id', member.family_id)
    .limit(1)
    .single();

  const { data: child } = await childQuery;

  // Fetch growth-relevant pages
  let pagesQuery = supabase
    .from('book_pages')
    .select('id, page_type, page_date, content')
    .eq('family_id', member.family_id)
    .in('page_type', ['birth_story', 'monthly_summary'])
    .is('deleted_at', null)
    .order('page_date', { ascending: true });

  if (!isOwner) {
    pagesQuery = (pagesQuery as typeof pagesQuery).eq('status', 'published');
  }

  const { data: pages } = await pagesQuery;

  // Build GrowthDataPoint array
  const dobStr = child?.date_of_birth;
  const dobDate = dobStr ? new Date(dobStr + 'T12:00:00') : null;

  const points: GrowthDataPoint[] = [];

  for (const page of pages ?? []) {
    if (page.page_type === 'birth_story') {
      const c = page.content as BirthStoryContent;
      if (!c.weight_kg && !c.height_cm) continue;
      points.push({
        age_months: 0,
        date: page.page_date,
        weight_kg: c.weight_kg || undefined,
        height_cm: c.height_cm || undefined,
        source: 'birth_story',
        page_id: page.id,
      });
    } else if (page.page_type === 'monthly_summary') {
      const c = page.content as MonthlySummaryContent;
      if (!c.weight_kg && !c.height_cm && !c.head_circumference_cm) continue;

      let age_months = 0;
      if (dobDate && c.year_month) {
        const [y, m] = c.year_month.split('-').map(Number);
        age_months = (y - dobDate.getFullYear()) * 12 + (m - (dobDate.getMonth() + 1));
      }

      points.push({
        age_months,
        date: page.page_date,
        weight_kg: c.weight_kg || undefined,
        height_cm: c.height_cm || undefined,
        head_circumference_cm: c.head_circumference_cm || undefined,
        source: 'monthly_summary',
        page_id: page.id,
      });
    }
  }

  // Deduplicate by age_months, keeping the richer row
  const deduped = new Map<number, GrowthDataPoint>();
  for (const pt of points) {
    const existing = deduped.get(pt.age_months);
    if (!existing) {
      deduped.set(pt.age_months, pt);
    } else {
      // Keep whichever has more non-null metrics
      const score = (p: GrowthDataPoint) =>
        (p.weight_kg ? 1 : 0) + (p.height_cm ? 1 : 0) + (p.head_circumference_cm ? 1 : 0);
      if (score(pt) > score(existing)) deduped.set(pt.age_months, pt);
    }
  }

  const dataPoints = Array.from(deduped.values()).sort((a, b) => a.age_months - b.age_months);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <a href="/book" className="text-text-secondary hover:text-text-primary text-sm transition">
          ← Back to Book
        </a>
        <h1 className="font-display font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
          Growth Chart
        </h1>
        <LogoutButton />
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 w-full">
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {child?.name ? `${child.name}'s growth over time` : 'Growth over time'} — from birth story &amp; monthly summaries
        </p>
        <GrowthChartClient dataPoints={dataPoints} />
      </main>
    </div>
  );
}
