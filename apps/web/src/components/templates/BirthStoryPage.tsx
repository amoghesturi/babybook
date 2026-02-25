import type { BirthStoryContent, BirthStoryVariant } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: BirthStoryContent;
  childName: string;
  variant?: BirthStoryVariant;
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

// ── Announcement variant ──────────────────────────────────────────────────────
function BirthStoryAnnouncement({ content, childName }: Omit<Props, 'variant'>) {
  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center px-8 py-12 gap-6"
      style={{ background: 'var(--color-surface)' }}
    >
      <div className="text-5xl mb-2">👶</div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.35em] mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          Announcing the arrival of
        </p>
        <h2
          className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: 'var(--color-primary-dark)', letterSpacing: '-0.02em' }}
        >
          {childName}
        </h2>
        <p className="font-handwritten text-2xl mt-1" style={{ color: 'var(--color-secondary)' }}>
          {formatDate(content.date_of_birth)}
          {content.time_of_birth && (
            <span style={{ color: 'var(--color-primary)' }}> &middot; {formatTime(content.time_of_birth)}</span>
          )}
        </p>
      </div>

      {/* Horizontal stats pill */}
      <div
        className="flex items-center gap-0 rounded-2xl overflow-hidden"
        style={{ border: '1.5px solid var(--color-border)', background: 'var(--color-background)' }}
      >
        <div className="flex flex-col items-center px-8 py-4 gap-0.5">
          <span className="text-2xl">⚖️</span>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{content.weight_kg.toFixed(2)} kg</span>
          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Weight</span>
        </div>
        <div style={{ width: '1px', background: 'var(--color-border)', alignSelf: 'stretch' }} />
        <div className="flex flex-col items-center px-8 py-4 gap-0.5">
          <span className="text-2xl">📏</span>
          <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>{content.height_cm} cm</span>
          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Length</span>
        </div>
        {content.hospital && (
          <>
            <div style={{ width: '1px', background: 'var(--color-border)', alignSelf: 'stretch' }} />
            <div className="flex flex-col items-center px-6 py-4 gap-0.5">
              <span className="text-2xl">🏥</span>
              <span className="font-bold text-sm text-center" style={{ color: 'var(--color-text-primary)', maxWidth: '90px' }}>{content.hospital}</span>
              <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Born at</span>
            </div>
          </>
        )}
      </div>

      {content.story_text && (
        <div className="max-w-sm px-4">
          <p className="font-handwritten text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            &ldquo;{content.story_text}&rdquo;
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>✦</span>
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

// ── Scrapbook variant ─────────────────────────────────────────────────────────
function BirthStoryScrapbook({ content, childName }: Omit<Props, 'variant'>) {
  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{ background: '#faf8f4' }}
    >
      {/* Washi tape header */}
      <div
        className="relative z-10 px-8 pt-10 pb-6"
        style={{
          background: `repeating-linear-gradient(
            -45deg,
            var(--color-primary-light) 0px,
            var(--color-primary-light) 18px,
            var(--color-secondary-light) 18px,
            var(--color-secondary-light) 36px
          )`,
          borderBottom: '2px dashed var(--color-border)',
        }}
      >
        <p className="font-handwritten text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          welcome to the world,
        </p>
        <h2
          className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'var(--color-primary-dark)' }}
        >
          {childName}
        </h2>
        <p className="font-handwritten text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(content.date_of_birth)}
          {content.time_of_birth && ` · ${formatTime(content.time_of_birth)}`}
        </p>
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
        {/* Stats column */}
        <div className="md:w-2/5 flex-shrink-0 p-6 flex flex-col gap-3">
          {content.photo_storage_path && (
            <div
              className="self-center p-2"
              style={{
                border: '2.5px dashed var(--color-primary)',
                borderRadius: '8px',
                background: 'white',
                transform: 'rotate(-2deg)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={storageUrl(content.photo_storage_path)}
                alt={`${childName} newborn photo`}
                style={{ width: '130px', height: '130px', objectFit: 'cover', display: 'block', borderRadius: '4px' }}
              />
            </div>
          )}
          <div className="space-y-2 mt-2">
            {[
              { icon: '⚖️', label: 'weight', value: `${content.weight_kg.toFixed(2)} kg` },
              { icon: '📏', label: 'length', value: `${content.height_cm} cm` },
              ...(content.hospital ? [{ icon: '🏥', label: 'born at', value: content.hospital }] : []),
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-lg flex-shrink-0">{icon}</span>
                <span className="font-handwritten text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}:</span>
                <span className="font-handwritten font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Story */}
        <div
          className="flex-1 px-6 py-5"
          style={{ borderLeft: '1px dashed var(--color-border)' }}
        >
          {content.story_text ? (
            <p className="font-handwritten text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              {content.story_text}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
              The story of {childName}&apos;s arrival is just beginning…
            </p>
          )}
        </div>
      </div>

      {/* Footer tape strip */}
      <div
        className="h-4 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            var(--color-primary) 0px,
            var(--color-primary) 20px,
            var(--color-secondary) 20px,
            var(--color-secondary) 40px
          )`,
          opacity: 0.15,
        }}
      />
    </div>
  );
}

// ── Classic variant (original) ────────────────────────────────────────────────
function BirthStoryClassic({ content, childName }: Omit<Props, 'variant'>) {
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

      <div
        className="relative z-10 px-8 pt-8 pb-6 flex flex-col items-center text-center"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-end gap-1 mb-3" style={{ color: 'var(--color-secondary)' }}>
          <span style={{ fontSize: '14px', opacity: 0.5 }}>★</span>
          <span style={{ fontSize: '22px' }}>★</span>
          <span style={{ fontSize: '28px' }}>✦</span>
          <span style={{ fontSize: '22px' }}>★</span>
          <span style={{ fontSize: '14px', opacity: 0.5 }}>★</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          The arrival of
        </p>
        <h2
          className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(1.7rem, 5vw, 2.6rem)', color: 'var(--color-primary-dark)', letterSpacing: '-0.01em' }}
        >
          {childName}
        </h2>
        <p className="font-handwritten text-lg mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(content.date_of_birth)}
          {content.time_of_birth && (
            <span style={{ color: 'var(--color-primary)' }}> &middot; {formatTime(content.time_of_birth)}</span>
          )}
        </p>
      </div>

      <div
        className="relative z-10 grid grid-cols-3 divide-x"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        {[
          { icon: '⚖️', value: `${content.weight_kg.toFixed(2)} kg`, label: 'Weight' },
          { icon: '📏', value: `${content.height_cm} cm`, label: 'Length' },
          { icon: '🏥', value: content.hospital || 'Home', label: 'Born at', small: true },
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
            <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
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
              <p className="font-handwritten text-center text-sm mt-2 px-1" style={{ color: '#7c5c2e' }}>
                {childName} ♡
              </p>
            </div>
          </div>
        )}
        <div
          className="flex-1 px-8 py-6 flex flex-col justify-center"
          style={!content.photo_storage_path ? { paddingLeft: '2.5rem' } : undefined}
        >
          {content.story_text ? (
            <>
              <div
                className="font-display font-bold leading-none mb-2 select-none"
                style={{ fontSize: '5rem', color: 'var(--color-primary-light)', lineHeight: 0.7, userSelect: 'none' }}
              >
                &ldquo;
              </div>
              <p className="font-handwritten text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {content.story_text}
              </p>
            </>
          ) : !content.photo_storage_path ? (
            <p className="text-sm italic text-center" style={{ color: 'var(--color-text-secondary)' }}>
              The story of {childName}&apos;s arrival is just beginning…
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="relative z-10 px-8 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)' }}>
          Welcome to the world
        </span>
        <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
      </div>
    </div>
  );
}

export function BirthStoryPage({ content, childName, variant = 'classic' }: Props) {
  if (variant === 'announcement') return <BirthStoryAnnouncement content={content} childName={childName} />;
  if (variant === 'scrapbook') return <BirthStoryScrapbook content={content} childName={childName} />;
  return <BirthStoryClassic content={content} childName={childName} />;
}
