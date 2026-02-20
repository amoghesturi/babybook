import type { BirthStoryContent } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: BirthStoryContent;
  childName: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function BirthStoryPage({ content, childName }: Props) {
  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 85% 10%, var(--color-primary-light) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 10% 90%, var(--color-secondary-light) 0%, transparent 60%),
          var(--color-surface)
        `,
      }}
    >
      {/* Subtle star field */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, var(--color-secondary) 1.5px, transparent 1.5px),
            radial-gradient(circle, var(--color-primary) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 50px 50px',
          backgroundPosition: '0 0, 25px 25px',
          opacity: 0.06,
        }}
      />

      {/* ── Header ── */}
      <div
        className="relative z-10 px-8 pt-8 pb-6 flex flex-col items-center text-center"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {/* Star cluster */}
        <div className="flex items-end gap-1 mb-3" style={{ color: 'var(--color-secondary)' }}>
          <span style={{ fontSize: '14px', opacity: 0.5 }}>★</span>
          <span style={{ fontSize: '22px' }}>★</span>
          <span style={{ fontSize: '28px' }}>✦</span>
          <span style={{ fontSize: '22px' }}>★</span>
          <span style={{ fontSize: '14px', opacity: 0.5 }}>★</span>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-[0.3em] mb-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The arrival of
        </p>
        <h2
          className="font-display font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.01em',
          }}
        >
          {childName}
        </h2>
        <p
          className="font-handwritten text-lg mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {formatDate(content.date_of_birth)}
          {content.time_of_birth && (
            <span style={{ color: 'var(--color-primary)' }}>
              {' '}· {formatTime(content.time_of_birth)}
            </span>
          )}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div
        className="relative z-10 grid grid-cols-3 divide-x"
        style={{ borderBottom: '1px solid var(--color-border)', divideColor: 'var(--color-border)' }}
      >
        {[
          {
            icon: '⚖️',
            value: `${content.weight_kg.toFixed(2)} kg`,
            label: 'Weight',
          },
          {
            icon: '📏',
            value: `${content.height_cm} cm`,
            label: 'Length',
          },
          {
            icon: '🏥',
            value: content.hospital || 'Home',
            label: 'Born at',
            small: true,
          },
        ].map(({ icon, value, label, small }, i) => (
          <div key={i} className="flex flex-col items-center py-5 px-3 gap-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-1"
              style={{ background: 'var(--color-background)' }}
            >
              {icon}
            </div>
            <div
              className={`font-bold leading-tight ${small ? 'text-sm text-center' : 'text-xl'}`}
              style={{ color: 'var(--color-text-primary)' }}
            >
              {value}
            </div>
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Story + photo ── */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
        {/* Photo with Polaroid frame */}
        {content.photo_storage_path && (
          <div className="md:w-2/5 flex-shrink-0 p-6 flex items-start justify-center">
            <div
              className="relative"
              style={{
                background: 'white',
                padding: '8px 8px 32px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)',
                transform: 'rotate(-1.5deg)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageUrl(content.photo_storage_path)}
                alt={`${childName} newborn photo`}
                className="block object-cover"
                style={{ width: '160px', height: '160px' }}
              />
              <p
                className="font-handwritten text-center text-sm mt-2 px-1"
                style={{ color: '#7c5c2e' }}
              >
                {childName} ♡
              </p>
            </div>
          </div>
        )}

        {/* Story text */}
        <div
          className="flex-1 px-8 py-6 flex flex-col justify-center"
          style={!content.photo_storage_path ? { paddingLeft: '2.5rem' } : undefined}
        >
          {content.story_text ? (
            <>
              {/* Opening quote mark */}
              <div
                className="font-display font-bold leading-none mb-2 select-none"
                style={{
                  fontSize: '5rem',
                  color: 'var(--color-primary-light)',
                  lineHeight: 0.7,
                  userSelect: 'none',
                }}
              >
                "
              </div>
              <p
                className="font-handwritten text-lg leading-relaxed"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {content.story_text}
              </p>
            </>
          ) : !content.photo_storage_path ? (
            <p
              className="text-sm italic text-center"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              The story of {childName}&apos;s arrival is just beginning…
            </p>
          ) : null}
        </div>
      </div>

      {/* ── Footer ornament ── */}
      <div
        className="relative z-10 px-8 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span
          className="text-xs font-medium tracking-widest uppercase"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Welcome to the world
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}
