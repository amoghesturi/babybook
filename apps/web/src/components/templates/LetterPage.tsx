'use client';

import type { LetterContent } from '@babybook/shared';

interface Props {
  content: LetterContent;
  childName: string;
  isOwner: boolean;
}

function isLocked(revealDate?: string): boolean {
  if (!revealDate) return false;
  return new Date(revealDate) > new Date();
}

function formatRevealDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

export function LetterPage({ content, childName, isOwner }: Props) {
  const locked = isLocked(content.reveal_date) && !isOwner;
  const textContent = renderTiptap(content.content_tiptap as Record<string, unknown>);

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #fdf8ef 0%, #fef9f2 100%)',
      }}
    >
      {/* Parchment texture */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'4\' height=\'4\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'0.5\' fill=\'%23c8a96e\' fill-opacity=\'0.4\'/%3E%3C/svg%3E")',
          backgroundSize: '4px 4px',
        }} />

      {/* Decorative border */}
      <div className="absolute inset-3 rounded-lg pointer-events-none"
        style={{ border: '1px solid #c8a96e', opacity: 0.4 }} />

      {/* Header */}
      <div className="relative z-10 px-10 pt-8 pb-4 text-center border-b" style={{ borderColor: '#e8d5b0' }}>
        <div className="text-3xl mb-1">💌</div>
        <p className="font-handwritten text-2xl font-semibold" style={{ color: '#7c5c2e' }}>
          Dear {childName},
        </p>
        <p className="text-xs mt-1 uppercase tracking-widest" style={{ color: '#a08060' }}>
          A letter from {content.author_name}
        </p>
      </div>

      {/* Locked state */}
      {locked ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          {/* Wax seal */}
          <div className="wax-seal">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8b2222, #c0392b)', border: '3px solid #6b1a1a' }}
            >
              🔒
            </div>
            {/* Seal ridges */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(transparent 0deg, rgba(255,255,255,0.15) 15deg, transparent 30deg, rgba(255,255,255,0.15) 45deg, transparent 60deg, rgba(255,255,255,0.15) 75deg, transparent 90deg, rgba(255,255,255,0.15) 105deg, transparent 120deg, rgba(255,255,255,0.15) 135deg, transparent 150deg, rgba(255,255,255,0.15) 165deg, transparent 180deg, rgba(255,255,255,0.15) 195deg, transparent 210deg, rgba(255,255,255,0.15) 225deg, transparent 240deg, rgba(255,255,255,0.15) 255deg, transparent 270deg, rgba(255,255,255,0.15) 285deg, transparent 300deg, rgba(255,255,255,0.15) 315deg, transparent 330deg, rgba(255,255,255,0.15) 345deg, transparent 360deg)',
              }}
            />
          </div>

          {/* Blurred preview */}
          <div className="relative max-w-xs">
            <p
              className="font-handwritten text-lg leading-relaxed select-none"
              style={{ color: '#7c5c2e', filter: 'blur(6px)', userSelect: 'none' }}
            >
              {textContent.slice(0, 200) || 'This letter is waiting for you…'}
            </p>
            <div className="absolute inset-0" />
          </div>

          <div className="mt-2">
            <p className="font-semibold text-sm" style={{ color: '#7c5c2e' }}>
              This letter unlocks on
            </p>
            <p className="font-display font-bold text-lg mt-0.5" style={{ color: '#8b2222' }}>
              {content.reveal_date ? formatRevealDate(content.reveal_date) : ''}
            </p>
          </div>
        </div>
      ) : (
        /* Open letter */
        <div className="relative z-10 flex-1 px-10 py-6">
          {isOwner && content.reveal_date && isLocked(content.reveal_date) && (
            <div className="mb-4 px-3 py-2 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-700">
              ⏰ Locked until {formatRevealDate(content.reveal_date)} for viewers
            </div>
          )}
          <p
            className="font-handwritten text-lg leading-relaxed whitespace-pre-wrap"
            style={{ color: '#4a3520' }}
          >
            {textContent}
          </p>
          <p className="font-handwritten text-base mt-6" style={{ color: '#7c5c2e' }}>
            With love,<br />
            <span className="font-semibold">{content.author_name}</span>
          </p>
        </div>
      )}
    </div>
  );
}
