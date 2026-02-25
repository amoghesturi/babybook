import type { CoverContent, CoverVariant } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: CoverContent;
  childName: string;
  childDob: string;
  variant?: CoverVariant;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function CornerOrnament({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="48" height="48" viewBox="0 0 48 48" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <path d="M4 4 Q4 26 26 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M4 4 Q26 4 4 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="4" cy="4" r="2.5" fill="currentColor" />
      <path d="M14 4 Q10 10 4 14" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.55" />
      <circle cx="30" cy="4" r="1.2" fill="currentColor" opacity="0.35" />
      <circle cx="4" cy="30" r="1.2" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

// ── Minimal variant ───────────────────────────────────────────────────────────
function CoverMinimal({ content, childName, childDob }: Omit<Props, 'variant'>) {
  const hasPhoto = Boolean(content.cover_photo_storage_path);
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden rounded-page flex flex-col items-center justify-center text-center"
      style={{ background: hasPhoto ? undefined : 'white' }}
    >
      {hasPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(content.cover_photo_storage_path)}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.45) 100%)' }}
          />
        </>
      )}
      <div className={`relative z-10 px-12 py-16 flex flex-col items-center ${hasPhoto ? 'text-white' : ''}`}>
        <p
          className="text-xs font-semibold uppercase tracking-[0.4em] mb-8"
          style={{ color: hasPhoto ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)' }}
        >
          A Keepsake for
        </p>
        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2.8rem, 9vw, 5rem)',
            color: hasPhoto ? 'white' : 'var(--color-text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {content.book_title || childName}
        </h1>
        {!content.book_title && (
          <p
            className="font-display font-light mt-2 tracking-[0.15em] uppercase text-sm"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}
          >
            Baby Book
          </p>
        )}
        <div
          className="my-8 w-16"
          style={{ height: '1px', background: hasPhoto ? 'rgba(255,255,255,0.4)' : 'var(--color-border)' }}
        />
        {childDob && (
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.55)' : 'var(--color-text-secondary)', fontVariant: 'small-caps' }}
          >
            Born {formatDate(childDob)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Watercolor variant ────────────────────────────────────────────────────────
function CoverWatercolor({ content, childName, childDob }: Omit<Props, 'variant'>) {
  const hasPhoto = Boolean(content.cover_photo_storage_path);
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden rounded-page flex flex-col items-center justify-center text-center"
      style={{
        background: hasPhoto
          ? undefined
          : `radial-gradient(ellipse 90% 70% at 20% 20%, var(--color-secondary-light) 0%, transparent 60%),
             radial-gradient(ellipse 80% 60% at 80% 80%, var(--color-primary-light) 0%, transparent 60%),
             var(--color-surface)`,
      }}
    >
      {hasPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(content.cover_photo_storage_path)}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.52) 100%)' }} />
        </>
      )}

      {/* Abstract botanical blob */}
      {!hasPhoto && (
        <svg
          className="absolute bottom-0 right-0 pointer-events-none"
          width="220" height="220" viewBox="0 0 220 220" fill="none"
          style={{ opacity: 0.18 }}
        >
          <ellipse cx="150" cy="150" rx="80" ry="60" fill="var(--color-secondary)" transform="rotate(-20 150 150)" />
          <ellipse cx="120" cy="160" rx="50" ry="35" fill="var(--color-primary)" transform="rotate(10 120 160)" />
          <path d="M90 180 Q130 120 180 140 Q160 190 90 180Z" fill="var(--color-secondary)" />
          <line x1="135" y1="185" x2="135" y2="120" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.5" />
          <path d="M135 145 Q118 135 110 118" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.5" />
          <path d="M135 155 Q152 143 162 128" stroke="var(--color-primary)" strokeWidth="1" fill="none" opacity="0.5" />
        </svg>
      )}

      {/* Soft polka dots */}
      {!hasPhoto && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-secondary) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            opacity: 0.05,
          }}
        />
      )}

      <div className={`relative z-10 px-10 py-12 max-w-sm mx-auto flex flex-col items-center ${hasPhoto ? 'text-white' : ''}`}>
        {!hasPhoto && <div className="text-4xl mb-4 opacity-70">🌸</div>}

        <p
          className="text-xs font-medium uppercase tracking-[0.28em] mb-3"
          style={{ color: hasPhoto ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)' }}
        >
          A Keepsake for
        </p>
        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
            color: hasPhoto ? 'white' : 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {content.book_title || childName}
        </h1>
        {!content.book_title && (
          <p
            className="font-display italic font-medium mt-1"
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.4rem)',
              color: hasPhoto ? 'rgba(255,255,255,0.82)' : 'var(--color-secondary)',
              letterSpacing: '0.08em',
            }}
          >
            Baby Book
          </p>
        )}
        {content.subtitle && (
          <p
            className="font-handwritten text-xl mt-3"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.82)' : 'var(--color-text-secondary)' }}
          >
            {content.subtitle}
          </p>
        )}
        <div className="flex items-center gap-3 my-6 w-full">
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.35)' : 'var(--color-secondary-light)' }} />
          <span style={{ color: hasPhoto ? 'rgba(255,255,255,0.6)' : 'var(--color-secondary)', fontSize: '18px' }}>✿</span>
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.35)' : 'var(--color-secondary-light)' }} />
        </div>
        {childDob && (
          <p
            className="text-xs font-medium tracking-[0.22em] uppercase"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.58)' : 'var(--color-text-secondary)' }}
          >
            Born {formatDate(childDob)}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Classic variant (original) ────────────────────────────────────────────────
function CoverClassic({ content, childName, childDob }: Omit<Props, 'variant'>) {
  const hasPhoto = Boolean(content.cover_photo_storage_path);

  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden rounded-page flex flex-col items-center justify-center text-center"
      style={{
        background: hasPhoto
          ? undefined
          : `radial-gradient(ellipse 80% 65% at 25% 25%, var(--color-primary-light) 0%, transparent 65%),
             radial-gradient(ellipse 80% 65% at 75% 75%, var(--color-secondary-light) 0%, transparent 65%),
             var(--color-surface)`,
      }}
    >
      {hasPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(content.cover_photo_storage_path)}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 35%, rgba(0,0,0,0.52) 100%)',
            }}
          />
        </>
      )}

      {!hasPhoto && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
            opacity: 0.07,
          }}
        />
      )}

      <div
        className="absolute pointer-events-none"
        style={{
          inset: '14px',
          border: '1.5px solid',
          borderColor: hasPhoto ? 'rgba(255,255,255,0.5)' : 'var(--color-primary)',
          borderRadius: '6px',
          opacity: 0.6,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '20px',
          border: '3px double',
          borderColor: hasPhoto ? 'rgba(255,255,255,0.28)' : 'var(--color-primary-light)',
          borderRadius: '4px',
          opacity: 0.55,
        }}
      />

      {[
        { cls: 'top-4 left-4', flip: [1, 1] },
        { cls: 'top-4 right-4', flip: [-1, 1] },
        { cls: 'bottom-4 left-4', flip: [1, -1] },
        { cls: 'bottom-4 right-4', flip: [-1, -1] },
      ].map(({ cls, flip }, i) => (
        <div
          key={i}
          className={`absolute ${cls} pointer-events-none`}
          style={{
            color: hasPhoto ? 'rgba(255,255,255,0.72)' : 'var(--color-primary)',
            transform: `scale(${flip[0]}, ${flip[1]})`,
            opacity: 0.8,
          }}
        >
          <CornerOrnament />
        </div>
      ))}

      <div
        className={`relative z-10 px-10 py-12 max-w-sm mx-auto flex flex-col items-center ${hasPhoto ? 'text-white' : ''}`}
      >
        <div className="flex items-center gap-3 justify-center mb-7 w-full">
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.45)' : 'var(--color-primary-light)' }} />
          <span style={{ fontSize: '9px', letterSpacing: '6px', color: hasPhoto ? 'rgba(255,255,255,0.65)' : 'var(--color-primary)' }}>
            ✦ ✦ ✦
          </span>
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.45)' : 'var(--color-primary-light)' }} />
        </div>

        <p
          className="text-xs font-medium uppercase tracking-[0.28em] mb-3"
          style={{ color: hasPhoto ? 'rgba(255,255,255,0.65)' : 'var(--color-text-secondary)' }}
        >
          A Keepsake for
        </p>

        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
            color: hasPhoto ? 'white' : 'var(--color-primary-dark)',
            textShadow: hasPhoto ? '0 2px 18px rgba(0,0,0,0.45)' : undefined,
            letterSpacing: '-0.02em',
          }}
        >
          {content.book_title || childName}
        </h1>

        {!content.book_title && (
          <p
            className="font-display italic font-medium mt-1"
            style={{
              fontSize: 'clamp(1rem, 3vw, 1.4rem)',
              color: hasPhoto ? 'rgba(255,255,255,0.82)' : 'var(--color-secondary)',
              letterSpacing: '0.08em',
            }}
          >
            Baby Book
          </p>
        )}

        {content.subtitle && (
          <p
            className="font-handwritten text-xl mt-3"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.82)' : 'var(--color-text-secondary)' }}
          >
            {content.subtitle}
          </p>
        )}

        <div className="flex items-center gap-3 justify-center mt-7 mb-5 w-full">
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.38)' : 'var(--color-border)' }} />
          <span style={{ color: hasPhoto ? 'rgba(255,255,255,0.65)' : 'var(--color-secondary)', fontSize: '20px', lineHeight: 1 }}>
            ❧
          </span>
          <div className="h-px flex-1" style={{ background: hasPhoto ? 'rgba(255,255,255,0.38)' : 'var(--color-border)' }} />
        </div>

        {childDob && (
          <p
            className="text-xs font-medium tracking-[0.22em] uppercase"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.58)' : 'var(--color-text-secondary)' }}
          >
            Born {formatDate(childDob)}
          </p>
        )}
      </div>

      {!hasPhoto && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: 'white',
            letterSpacing: '0.25em',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          Memory Book
        </div>
      )}
    </div>
  );
}

export function CoverPage({ content, childName, childDob, variant = 'classic' }: Props) {
  if (variant === 'minimal') return <CoverMinimal content={content} childName={childName} childDob={childDob} />;
  if (variant === 'watercolor') return <CoverWatercolor content={content} childName={childName} childDob={childDob} />;
  return <CoverClassic content={content} childName={childName} childDob={childDob} />;
}
