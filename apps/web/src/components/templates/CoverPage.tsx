import type { CoverContent } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: CoverContent;
  childName: string;
  childDob: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function CoverPage({ content, childName, childDob }: Props) {
  const hasPhoto = Boolean(content.cover_photo_storage_path);

  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full overflow-hidden rounded-page flex flex-col items-center justify-center text-center"
      style={{
        background: hasPhoto
          ? undefined
          : 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-secondary-light) 50%, var(--color-primary-light) 100%)',
      }}
    >
      {/* Background photo */}
      {hasPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(content.cover_photo_storage_path)}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        </>
      )}

      {/* Decorative border */}
      <div
        className="absolute inset-4 rounded-lg pointer-events-none"
        style={{
          border: '3px solid',
          borderColor: hasPhoto ? 'rgba(255,255,255,0.6)' : 'var(--color-primary)',
          opacity: 0.7,
        }}
      />

      {/* Corner decorations */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos) => (
        <div
          key={pos}
          className={`absolute ${pos} text-2xl opacity-60`}
          style={{ color: hasPhoto ? 'white' : 'var(--color-primary)' }}
        >
          ✦
        </div>
      ))}

      {/* Content */}
      <div className={`relative z-10 px-8 py-12 ${hasPhoto ? 'text-white' : ''}`}>
        {/* Baby emoji */}
        <div className="text-5xl mb-4">👶</div>

        <h1
          className="font-display font-bold leading-tight mb-2"
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            color: hasPhoto ? 'white' : 'var(--color-primary-dark)',
          }}
        >
          {content.book_title || `${childName}'s Baby Book`}
        </h1>

        {content.subtitle && (
          <p
            className="text-lg mb-4 font-handwritten"
            style={{ color: hasPhoto ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)' }}
          >
            {content.subtitle}
          </p>
        )}

        <div
          className="mt-4 text-sm font-medium tracking-widest uppercase"
          style={{ color: hasPhoto ? 'rgba(255,255,255,0.7)' : 'var(--color-text-secondary)' }}
        >
          {childDob ? formatDate(childDob) : ''}
        </div>

        {/* Decorative line */}
        <div className="mt-4 flex items-center gap-3 justify-center">
          <div className="h-px w-12" style={{ background: hasPhoto ? 'rgba(255,255,255,0.5)' : 'var(--color-border)' }} />
          <span style={{ color: hasPhoto ? 'rgba(255,255,255,0.6)' : 'var(--color-secondary)' }}>♡</span>
          <div className="h-px w-12" style={{ background: hasPhoto ? 'rgba(255,255,255,0.5)' : 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}
