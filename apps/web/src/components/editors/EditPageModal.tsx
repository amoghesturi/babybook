'use client';

import { PAGE_TEMPLATES } from '@babybook/shared';
import type {
  BookPage,
  BirthStoryContent,
  JournalContent,
  LetterContent,
  MilestoneContent,
  MonthlySummaryContent,
  PhotoSpreadContent,
} from '@babybook/shared';
import { BirthStoryEditor } from './BirthStoryEditor';
import { JournalEditor } from './JournalEditor';
import { LetterEditor } from './LetterEditor';
import { MilestoneEditor } from './MilestoneEditor';
import { MonthlySummaryEditor } from './MonthlySummaryEditor';
import { PhotoSpreadEditor } from './PhotoSpreadEditor';

interface Props {
  page: BookPage;
  onClose: () => void;
}

export function EditPageModal({ page, onClose }: Props) {
  const template = PAGE_TEMPLATES.find((t) => t.type === page.page_type);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-xl flex-1" style={{ color: 'var(--color-text-primary)' }}>
            Edit {template?.label ?? 'Page'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Editor */}
        <div className="p-6">
          {page.page_type === 'birth_story' && (
            <BirthStoryEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as BirthStoryContent}
              initialPageDate={page.page_date}
            />
          )}
          {page.page_type === 'journal' && (
            <JournalEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as JournalContent}
              initialPageDate={page.page_date}
            />
          )}
          {page.page_type === 'letter' && (
            <LetterEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as LetterContent}
              initialPageDate={page.page_date}
            />
          )}
          {page.page_type === 'milestone' && (
            <MilestoneEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as MilestoneContent}
              initialPageDate={page.page_date}
            />
          )}
          {page.page_type === 'monthly_summary' && (
            <MonthlySummaryEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as MonthlySummaryContent}
            />
          )}
          {page.page_type === 'photo_spread' && (
            <PhotoSpreadEditor
              onClose={onClose}
              pageId={page.id}
              initialContent={page.content as PhotoSpreadContent}
              initialPageDate={page.page_date}
              templateVariant={page.template_variant ?? undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
