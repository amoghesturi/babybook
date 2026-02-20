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

function formatYearMonth(yearMonth: string): { month: string; year: string; monthShort: string } {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return {
    month: d.toLocaleDateString('en-US', { month: 'long' }),
    monthShort: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: String(y),
  };
}

const MONTH_COLORS: Record<number, string> = {
  1: '#0891b2', 2: '#e879b0', 3: '#4a8c3f', 4: '#d97706',
  5: '#8b5cf6', 6: '#f59e0b', 7: '#ec4899', 8: '#0891b2',
  9: '#d97706', 10: '#dc2626', 11: '#4a8c3f', 12: '#8b5cf6',
};

export function MonthlySummaryPage({ content, childName, childDob }: Props) {
  const ageMonths = childDob ? getAgeInMonths(childDob, content.year_month) : null;
  const ageLabel =
    ageMonths !== null
      ? ageMonths < 12
        ? `${ageMonths} month${ageMonths !== 1 ? 's' : ''} old`
        : `${Math.floor(ageMonths / 12)} year${Math.floor(ageMonths / 12) !== 1 ? 's' : ''} ${ageMonths % 12 ? `${ageMonths % 12}m` : ''} old`
      : null;

  const { month, year, monthShort } = formatYearMonth(content.year_month);
  const monthNum = parseInt(content.year_month.split('-')[1]);
  const accentColor = MONTH_COLORS[monthNum] ?? 'var(--color-primary)';

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col relative"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Giant ghost month number in background */}
      <div
        className="absolute pointer-events-none select-none font-display font-bold"
        style={{
          fontSize: 'clamp(8rem, 22vw, 14rem)',
          color: accentColor,
          opacity: 0.05,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          lineHeight: 1,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {monthShort}
      </div>

      {/* ── Header: washi tape + month banner ── */}
      <div className="relative z-10">
        {/* Washi tape strips */}
        <div
          className="absolute -top-1 left-0 right-0 h-5 opacity-60 pointer-events-none"
          style={{
            background: `repeating-linear-gradient(90deg, ${accentColor}30 0px, ${accentColor}30 20px, transparent 20px, transparent 30px)`,
          }}
        />

        {/* Month banner */}
        <div
          className="px-8 pt-10 pb-7 relative"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
          }}
        >
          {/* Decorative circle blobs */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />
          <div
            className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          />

          <div className="relative z-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70 mb-0.5">
                Monthly Update
              </p>
              <h2 className="font-display font-bold text-white leading-none" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.8rem)' }}>
                {month}
              </h2>
              <p className="font-handwritten text-lg text-white/80 mt-0.5">{year}</p>
            </div>

            {ageLabel && (
              <div
                className="flex flex-col items-center px-4 py-2 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                <span className="text-xl">🎂</span>
                <span className="text-white font-bold text-sm mt-0.5">{childName}</span>
                <span className="text-white/80 text-xs">{ageLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      {(content.weight_kg || content.height_cm) && (
        <div
          className="relative z-10 flex divide-x"
          style={{
            borderBottom: '1px solid var(--color-border)',
            divideColor: 'var(--color-border)',
          }}
        >
          {content.weight_kg && (
            <div className="flex-1 flex items-center gap-3 px-8 py-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${accentColor}15`, border: `2px solid ${accentColor}30` }}
              >
                ⚖️
              </div>
              <div>
                <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                  {content.weight_kg.toFixed(1)} kg
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Weight
                </div>
              </div>
            </div>
          )}
          {content.height_cm && (
            <div className="flex-1 flex items-center gap-3 px-8 py-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${accentColor}15`, border: `2px solid ${accentColor}30` }}
              >
                📏
              </div>
              <div>
                <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                  {content.height_cm} cm
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Height
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Notes / highlights ── */}
      <div className="relative z-10 flex-1 px-8 py-6">
        {content.notes ? (
          <>
            <p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: accentColor }}
            >
              ✦ This Month&apos;s Highlights
            </p>
            <p
              className="font-handwritten text-lg leading-relaxed"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {content.notes}
            </p>
          </>
        ) : (
          <p
            className="text-sm italic text-center mt-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            A wonderful month with {childName} ✨
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        className="relative z-10 px-8 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          📖 {childName}&apos;s Baby Book
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}
