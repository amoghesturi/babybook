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

export function BirthStoryPage({ content, childName }: Props) {
  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{ background: 'linear-gradient(160deg, #fef9ff 0%, #f0faf8 100%)' }}
    >
      {/* Watercolor blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl"
        style={{ background: 'var(--color-primary)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'var(--color-secondary)' }} />

      {/* Header */}
      <div className="relative z-10 px-8 pt-8 pb-4 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-4xl mb-2">🌟</div>
        <h2 className="font-display font-bold text-2xl md:text-3xl" style={{ color: 'var(--color-primary-dark)' }}>
          Welcome to the World, {childName}!
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {formatDate(content.date_of_birth)}
          {content.time_of_birth && ` · ${content.time_of_birth}`}
        </p>
      </div>

      {/* Stats row */}
      <div className="relative z-10 grid grid-cols-3 gap-4 px-8 py-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="text-center">
          <div className="text-3xl mb-1">⚖️</div>
          <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
            {content.weight_kg.toFixed(2)} kg
          </div>
          <div className="text-xs uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Weight
          </div>
        </div>
        <div className="text-center border-x" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-3xl mb-1">📏</div>
          <div className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
            {content.height_cm} cm
          </div>
          <div className="text-xs uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Length
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-1">🏥</div>
          <div className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
            {content.hospital || 'Home'}
          </div>
          <div className="text-xs uppercase tracking-wide mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            Born at
          </div>
        </div>
      </div>

      {/* Story text + optional photo */}
      <div className="relative z-10 flex-1 flex flex-col md:flex-row gap-6 px-8 py-6">
        {content.photo_storage_path && (
          <div className="md:w-2/5 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storageUrl(content.photo_storage_path)}
              alt={`${childName} newborn photo`}
              className="w-full h-48 md:h-full object-cover rounded-xl shadow-md"
            />
          </div>
        )}
        {content.story_text && (
          <div className="flex-1">
            <p className="font-handwritten text-lg leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
              {content.story_text}
            </p>
          </div>
        )}
        {!content.story_text && !content.photo_storage_path && (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm italic" style={{ color: 'var(--color-text-secondary)' }}>
              The story of {childName}&apos;s arrival is just beginning…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
