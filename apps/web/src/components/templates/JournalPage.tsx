import type { JournalContent } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: JournalContent;
  pageDate: string;
}

const MOODS: Record<string, string> = {
  happy: '😊',
  excited: '🤩',
  grateful: '🥹',
  tired: '😴',
  bittersweet: '🥲',
  proud: '🥰',
  anxious: '😟',
  peaceful: '😌',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderTiptap(content: Record<string, unknown>): string {
  if (!content || !content.content) return '';
  // Simple text extraction from Tiptap JSON
  function extractText(node: unknown): string {
    if (!node || typeof node !== 'object') return '';
    const n = node as Record<string, unknown>;
    if (n.type === 'text') return (n.text as string) || '';
    if (Array.isArray(n.content)) {
      return (n.content as unknown[]).map(extractText).join(
        n.type === 'paragraph' || n.type === 'heading' ? '\n' : ''
      );
    }
    return '';
  }
  return extractText(content);
}

export function JournalPage({ content, pageDate }: Props) {
  const textContent = renderTiptap(content.content_tiptap as Record<string, unknown>);
  const moodEmoji = content.mood ? (MOODS[content.mood] ?? content.mood) : null;

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Ruled lines background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, var(--color-border) 27px, var(--color-border) 28px)',
          backgroundSize: '100% 28px',
          backgroundPositionY: '60px',
          opacity: 0.4,
        }}
      />

      {/* Left margin line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: '48px', width: '1px', background: 'var(--color-primary-light)', opacity: 0.6 }}
      />

      {/* Header */}
      <div className="relative z-10 px-12 pt-6 pb-3 flex items-start justify-between">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl" style={{ color: 'var(--color-text-primary)' }}>
            {content.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
            {formatDate(pageDate)}
          </p>
        </div>
        {moodEmoji && (
          <div className="text-3xl ml-4 flex-shrink-0" title={`Mood: ${content.mood}`}>
            {moodEmoji}
          </div>
        )}
      </div>

      {/* Header photo */}
      {content.header_photo_storage_path && (
        <div className="relative z-10 px-12 pb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={storageUrl(content.header_photo_storage_path)}
            alt="Journal header"
            className="w-full h-32 object-cover rounded-xl"
          />
        </div>
      )}

      {/* Journal content */}
      <div className="relative z-10 flex-1 px-12 pb-6">
        <p className="font-handwritten text-lg leading-[28px] whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
          {textContent || content.title}
        </p>
      </div>

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div className="relative z-10 px-12 pb-6 flex flex-wrap gap-2">
          {content.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
