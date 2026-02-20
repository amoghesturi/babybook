import type { JournalContent } from '@babybook/shared';
import { storageUrl } from '@/lib/storageUrl';

interface Props {
  content: JournalContent;
  pageDate: string;
}

const MOODS: Record<string, { emoji: string; label: string; color: string }> = {
  happy:       { emoji: '😊', label: 'Happy',       color: '#f59e0b' },
  excited:     { emoji: '🤩', label: 'Excited',     color: '#ec4899' },
  grateful:    { emoji: '🥹', label: 'Grateful',    color: '#8b5cf6' },
  tired:       { emoji: '😴', label: 'Tired',       color: '#6b7280' },
  bittersweet: { emoji: '🥲', label: 'Bittersweet', color: '#0891b2' },
  proud:       { emoji: '🥰', label: 'Proud',       color: '#e879b0' },
  anxious:     { emoji: '😟', label: 'Anxious',     color: '#d97706' },
  peaceful:    { emoji: '😌', label: 'Peaceful',    color: '#4a8c3f' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'long' }),
    date: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    year: d.getFullYear(),
  };
}

function renderTiptap(content: Record<string, unknown>): string {
  if (!content || !content.content) return '';
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
  const moodInfo = content.mood ? (MOODS[content.mood] ?? null) : null;
  const dateInfo = formatDate(pageDate);

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* ── Left spine: binder holes ── */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-evenly py-8"
        style={{
          width: '36px',
          background: 'var(--color-background)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: '16px',
              height: '16px',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </div>

      {/* ── Main page ── */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Ruled lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(transparent, transparent 27px, var(--color-border) 27px, var(--color-border) 28px)',
            backgroundSize: '100% 28px',
            backgroundPositionY: '72px',
            opacity: 0.35,
          }}
        />
        {/* Red margin line */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{ left: '52px', width: '1.5px', background: '#ef4444', opacity: 0.25 }}
        />

        {/* ── Header strip ── */}
        <div
          className="relative z-10 flex items-stretch gap-0"
          style={{ borderBottom: '1.5px solid var(--color-border)', minHeight: '72px' }}
        >
          {/* Date box */}
          <div
            className="flex flex-col items-center justify-center flex-shrink-0 px-3"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              minWidth: '64px',
              color: 'white',
            }}
          >
            <span className="font-bold leading-none" style={{ fontSize: '1.7rem' }}>
              {dateInfo.day}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {dateInfo.month}
            </span>
            <span className="text-xs opacity-75">{dateInfo.year}</span>
          </div>

          {/* Title + weekday */}
          <div className="flex-1 flex flex-col justify-center px-4 py-2">
            <h2
              className="font-display font-bold leading-tight"
              style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--color-text-primary)' }}
            >
              {content.title}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {dateInfo.weekday}
            </p>
          </div>

          {/* Mood badge */}
          {moodInfo && (
            <div
              className="flex flex-col items-center justify-center px-4 flex-shrink-0 gap-1"
              style={{ borderLeft: '1px solid var(--color-border)' }}
            >
              <div className="text-3xl">{moodInfo.emoji}</div>
              <div
                className="text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{
                  background: `${moodInfo.color}18`,
                  color: moodInfo.color,
                  border: `1px solid ${moodInfo.color}30`,
                }}
              >
                {moodInfo.label}
              </div>
            </div>
          )}
        </div>

        {/* ── Header photo ── */}
        {content.header_photo_storage_path && (
          <div className="relative z-10 px-14 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storageUrl(content.header_photo_storage_path)}
              alt="Journal header"
              className="w-full rounded-xl object-cover"
              style={{ height: '120px' }}
            />
          </div>
        )}

        {/* ── Journal body ── */}
        <div className="relative z-10 flex-1 px-14 py-5">
          <p
            className="font-handwritten text-lg leading-[28px] whitespace-pre-wrap"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {textContent || content.title}
          </p>
        </div>

        {/* ── Tags ── */}
        {content.tags && content.tags.length > 0 && (
          <div
            className="relative z-10 px-14 pb-5 flex flex-wrap gap-2"
            style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}
          >
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="font-handwritten text-sm px-3 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-background)',
                  color: 'var(--color-primary)',
                  border: '1.5px solid var(--color-primary-light)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
