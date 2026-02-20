'use client';

import { useState } from 'react';
import { PAGE_TEMPLATES } from '@babybook/shared';
import type { PageType } from '@babybook/shared';
import { MilestoneEditor } from './MilestoneEditor';
import { PhotoSpreadEditor } from './PhotoSpreadEditor';
import { JournalEditor } from './JournalEditor';
import { LetterEditor } from './LetterEditor';
import { MonthlySummaryEditor } from './MonthlySummaryEditor';
import { BirthStoryEditor } from './BirthStoryEditor';

interface Props {
  pageId: string;
  onClose: () => void;
}

export function AddPageModal({ pageId, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<PageType | null>(null);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const addableTypes = PAGE_TEMPLATES.filter(
    (t) => t.type !== 'cover'
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!selectedType ? (
          /* Template picker */
          <div>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="font-display font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
                Add a Page
              </h2>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition text-xl leading-none">
                ×
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {addableTypes.map((template) => (
                <button
                  key={template.type}
                  onClick={() => setSelectedType(template.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center hover:border-primary hover:bg-primary/5 transition group"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {template.emoji}
                  </span>
                  <span className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {template.label}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Editor for selected type */
          <div>
            <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setSelectedType(null)}
                className="text-text-secondary hover:text-text-primary transition text-sm"
              >
                ←
              </button>
              <h2 className="font-display font-bold text-xl flex-1" style={{ color: 'var(--color-text-primary)' }}>
                {PAGE_TEMPLATES.find((t) => t.type === selectedType)?.label}
              </h2>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition text-xl leading-none">
                ×
              </button>
            </div>
            <div className="p-6">
              {selectedType === 'birth_story' && (
                <BirthStoryEditor onClose={onClose} />
              )}
              {selectedType === 'milestone' && (
                <MilestoneEditor onClose={onClose} />
              )}
              {selectedType === 'photo_spread' && (
                <PhotoSpreadEditor onClose={onClose} />
              )}
              {selectedType === 'journal' && (
                <JournalEditor onClose={onClose} />
              )}
              {selectedType === 'letter' && (
                <LetterEditor onClose={onClose} />
              )}
              {selectedType === 'monthly_summary' && (
                <MonthlySummaryEditor onClose={onClose} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
