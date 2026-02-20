import type { MonthlySummaryContent } from '@babybook/shared';

interface Props {
  content: MonthlySummaryContent;
  childName: string;
  childDob: string;
}

function getAgeInMonths(dob: string, yearMonth: string): number {
  const birth = new Date(dob);
  const [y, m] = yearMonth.split('-').map(Number);
  return (y - birth.getFullYear()) * 12 + (m - 1 - birth.getMonth());
}

function formatYearMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export function MonthlySummaryPage({ content, childName, childDob }: Props) {
  const ageMonths = childDob ? getAgeInMonths(childDob, content.year_month) : null;
  const ageLabel = ageMonths !== null
    ? ageMonths < 12
      ? `${ageMonths} months old`
      : `${Math.floor(ageMonths / 12)} year${Math.floor(ageMonths / 12) !== 1 ? 's' : ''} ${ageMonths % 12 ? `${ageMonths % 12} month${ageMonths % 12 !== 1 ? 's' : ''}` : ''} old`
    : null;

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Month banner */}
      <div
        className="px-8 py-6 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="text-3xl mb-1">📅</div>
          <h2 className="font-display font-bold text-2xl text-white">
            {formatYearMonth(content.year_month)}
          </h2>
          {ageLabel && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-4 py-1 text-white text-sm font-medium">
              🎂 {childName} is {ageLabel}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {(content.weight_kg || content.height_cm) && (
        <div className="grid grid-cols-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {content.weight_kg && (
            <div className="px-8 py-4 text-center border-r" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-2xl mb-1">⚖️</div>
              <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                {content.weight_kg.toFixed(1)} kg
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                Weight
              </div>
            </div>
          )}
          {content.height_cm && (
            <div className="px-8 py-4 text-center">
              <div className="text-2xl mb-1">📏</div>
              <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                {content.height_cm} cm
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                Height
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="flex-1 px-8 py-6">
        {content.notes ? (
          <p className="font-handwritten text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {content.notes}
          </p>
        ) : (
          <p className="text-sm italic text-center mt-8" style={{ color: 'var(--color-text-secondary)' }}>
            A wonderful month with {childName} ✨
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-8 pb-6 flex items-center gap-2">
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>📖 {childName}&apos;s Baby Book</span>
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}
