import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GrowthPageClient } from './GrowthPageClient';
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
  const { data: child } = await supabase
    .from('children')
    .select('name, date_of_birth')
    .eq('family_id', member.family_id)
    .limit(1)
    .single();

  // Fetch all page IDs to find the last page (for prev navigation)
  let navQuery = supabase
    .from('book_pages')
    .select('id')
    .eq('family_id', member.family_id)
    .is('deleted_at', null)
    .order('page_date', { ascending: true })
    .order('sort_order', { ascending: true });

  if (!isOwner) {
    navQuery = (navQuery as typeof navQuery).eq('status', 'published');
  }

  const { data: allPages } = await navQuery;
  const lastPageId = allPages && allPages.length > 0 ? allPages[allPages.length - 1].id : null;

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

  // Fetch direct measurements
  const { data: directMeasurements } = await supabase
    .from('growth_measurements')
    .select('*')
    .eq('family_id', member.family_id)
    .order('measured_at', { ascending: true });

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

  // Map direct measurements to GrowthDataPoints
  for (const dm of directMeasurements ?? []) {
    let age_months = 0;
    if (dobDate && dm.measured_at) {
      const measuredDate = new Date(dm.measured_at + 'T12:00:00');
      age_months =
        (measuredDate.getFullYear() - dobDate.getFullYear()) * 12 +
        (measuredDate.getMonth() - dobDate.getMonth());
    }

    points.push({
      age_months,
      date: dm.measured_at,
      weight_kg: dm.weight_kg ?? undefined,
      height_cm: dm.height_cm ?? undefined,
      head_circumference_cm: dm.head_circumference_cm ?? undefined,
      source: 'direct',
      page_id: null,
      measurement_id: dm.id,
    });
  }

  // Deduplicate by age_months, keeping the richer row
  const deduped = new Map<number, GrowthDataPoint>();
  for (const pt of points) {
    const existing = deduped.get(pt.age_months);
    if (!existing) {
      deduped.set(pt.age_months, pt);
    } else {
      const score = (p: GrowthDataPoint) =>
        (p.weight_kg ? 1 : 0) + (p.height_cm ? 1 : 0) + (p.head_circumference_cm ? 1 : 0);
      if (score(pt) > score(existing)) deduped.set(pt.age_months, pt);
    }
  }

  const dataPoints = Array.from(deduped.values()).sort((a, b) => a.age_months - b.age_months);
  const childName = child?.name ?? '';

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Top bar — matches BookReader */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col min-w-0">
          <span className="font-display text-lg font-semibold text-primary truncate leading-tight">
            {childName ? `${childName}'s Baby Book` : 'Baby Book'}
          </span>
          <span className="text-xs truncate leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
            Growth Chart
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
        </div>
      </header>

      {/* Book area */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-4">
        <div className="w-full max-w-2xl relative">
          {/* Prev arrow — back to last regular page */}
          {lastPageId && (
            <a
              href={`/book/${lastPageId}`}
              className="absolute left-0 top-8 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 rounded-full bg-surface shadow-md flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-lg transition"
              aria-label="Previous page"
            >
              ◀
            </a>
          )}

          {/* Growth chart card */}
          <div
            className="book-page w-full rounded-page overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              minHeight: '500px',
            }}
          >
            {/* Card header */}
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              }}
            >
              <span className="text-3xl">📈</span>
              <div>
                <h1 className="font-display font-bold text-white text-xl leading-tight">
                  Growth Chart
                </h1>
                <p className="text-white/75 text-sm">
                  {childName ? `${childName}'s measurements over time` : 'Measurements over time'}
                </p>
              </div>
            </div>

            <div className="p-6">
              <GrowthPageClient dataPoints={dataPoints} isOwner={isOwner} />
            </div>
          </div>

          {/* No next arrow — growth chart is the last "page" */}
          <button
            disabled
            className="absolute right-0 top-8 translate-x-4 md:translate-x-12 z-10 w-10 h-10 rounded-full bg-surface shadow-md flex items-center justify-center text-text-secondary opacity-20 cursor-not-allowed"
            aria-label="Next page"
          >
            ▶
          </button>
        </div>

        {/* Page counter */}
        <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <span>
            {(allPages?.length ?? 0) + 1} / {(allPages?.length ?? 0) + 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            Growth Chart
          </span>
        </div>
      </main>
    </div>
  );
}
