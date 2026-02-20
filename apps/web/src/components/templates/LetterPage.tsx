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
  const initials = (content.author_name ?? '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 100% 0%, #fef3e2 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 0% 100%, #fef3e2 0%, transparent 55%),
          linear-gradient(160deg, #fdf8ef 0%, #fefaf4 100%)
        `,
      }}
    >
      {/* Parchment grain texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
          opacity: 0.6,
        }}
      />

      {/* Fold creases */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: '33.33%', height: '1px', background: 'rgba(160,120,60,0.12)' }}
      />
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: '66.66%', height: '1px', background: 'rgba(160,120,60,0.12)' }}
      />

      {/* Outer border */}
      <div
        className="absolute inset-3 pointer-events-none rounded-lg"
        style={{ border: '1px solid rgba(180,140,70,0.3)' }}
      />

      {/* Owner preview banner */}
      {isOwner && content.reveal_date && isLocked(content.reveal_date) && (
        <div
          className="relative z-10 mx-4 mt-3 mb-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
          style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}
        >
          ⏰ Locked until {formatRevealDate(content.reveal_date)} for viewers
        </div>
      )}

      {/* ── Header ── */}
      <div
        className="relative z-10 px-10 pt-8 pb-5 flex flex-col items-center text-center"
        style={{ borderBottom: '1px solid rgba(180,140,70,0.25)' }}
      >
        {/* Postmark-style circle */}
        <div
          className="absolute top-5 right-8 w-16 h-16 rounded-full flex flex-col items-center justify-center opacity-30 pointer-events-none"
          style={{ border: '2px solid #8b6914' }}
        >
          <div className="text-xs font-bold uppercase" style={{ color: '#8b6914', letterSpacing: '1px', fontSize: '7px' }}>
            SEALED
          </div>
          <div className="text-xs" style={{ color: '#8b6914', fontSize: '8px' }}>WITH LOVE</div>
        </div>

        {/* Envelope icon */}
        <div className="text-3xl mb-2 opacity-70">💌</div>

        {/* "Dear [Name]," */}
        <p
          className="font-handwritten font-semibold"
          style={{ fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#5c3d14' }}
        >
          Dear {childName},
        </p>
        <p className="text-xs mt-1.5 font-medium uppercase tracking-[0.22em]" style={{ color: '#9a7840' }}>
          A letter from {content.author_name}
        </p>

        {/* Ornamental line */}
        <div className="flex items-center gap-2 mt-4 w-full max-w-xs justify-center">
          <div className="h-px flex-1" style={{ background: 'rgba(180,140,70,0.35)' }} />
          <span style={{ color: '#c9a227', fontSize: '14px' }}>❧</span>
          <div className="h-px flex-1" style={{ background: 'rgba(180,140,70,0.35)' }} />
        </div>
      </div>

      {/* ── Locked state ── */}
      {locked ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center gap-5 py-8">
          {/* Wax seal */}
          <div className="relative" style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.22))' }}>
            <div
              className="w-28 h-28 rounded-full flex flex-col items-center justify-center relative"
              style={{
                background: 'linear-gradient(145deg, #c0392b 0%, #8b2222 60%, #6b1818 100%)',
              }}
            >
              {/* Seal ridges */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                return (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      width: '3px',
                      height: '56px',
                      background: 'rgba(255,255,255,0.06)',
                      transformOrigin: '50% 100%',
                      bottom: '50%',
                      left: 'calc(50% - 1.5px)',
                      transform: `rotate(${i * 30}deg)`,
                    }}
                  />
                );
              })}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-3xl">🔒</span>
                {initials && (
                  <span
                    className="font-display font-bold text-sm mt-0.5"
                    style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}
                  >
                    {initials}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Blurred preview */}
          <div
            className="relative max-w-xs px-4"
            style={{ userSelect: 'none' }}
          >
            <p
              className="font-handwritten text-lg leading-relaxed"
              style={{ color: '#7c5c2e', filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
            >
              {textContent.slice(0, 180) || 'This letter is waiting for you, full of love and memories…'}
            </p>
            <div className="absolute inset-0" />
          </div>

          <div className="mt-1">
            <p className="text-sm font-medium" style={{ color: '#7c5c2e' }}>
              This letter unlocks on
            </p>
            <p className="font-display font-bold text-xl mt-0.5" style={{ color: '#8b2222' }}>
              {content.reveal_date ? formatRevealDate(content.reveal_date) : ''}
            </p>
          </div>
        </div>
      ) : (
        /* ── Open letter ── */
        <div className="relative z-10 flex-1 px-12 py-6 flex flex-col">
          <p
            className="font-handwritten text-lg leading-[1.85] whitespace-pre-wrap flex-1"
            style={{ color: '#3d2a10' }}
          >
            {textContent}
          </p>

          {/* Sign-off */}
          <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(180,140,70,0.2)' }}>
            <p className="font-handwritten text-base" style={{ color: '#6b4c1e' }}>
              With all my love,
            </p>
            <p
              className="font-handwritten font-bold text-2xl mt-0.5"
              style={{ color: '#5c3d14' }}
            >
              {content.author_name}
            </p>
            {/* Decorative flourish */}
            <div
              className="mt-2 font-handwritten"
              style={{ color: '#c9a227', fontSize: '24px', lineHeight: 1 }}
            >
              ∼∼∼
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
