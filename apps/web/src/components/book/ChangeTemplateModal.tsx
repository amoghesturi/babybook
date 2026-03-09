'use client';

import { useState, useTransition } from 'react';
import { PAGE_TEMPLATES } from '@babybook/shared';
import { changePageTemplate } from '@/app/actions/pages';
import type { PageType, SectionTitleContent } from '@babybook/shared';

interface Props {
  pageId: string;
  pageType: PageType;
  currentVariant: string;
  onClose: () => void;
  /** Pass for section_title pages so we know the section_type */
  pageContent?: SectionTitleContent;
}

export function ChangeTemplateModal({ pageId, pageType, currentVariant, onClose, pageContent }: Props) {
  const template = PAGE_TEMPLATES.find((t) => t.type === pageType);
  const [selected, setSelected] = useState(currentVariant);
  const [isPending, startTransition] = useTransition();

  if (!template) return null;

  // For section_title pages: only custom sections get variant choices
  if (pageType === 'section_title') {
    const sectionType = (pageContent as SectionTitleContent | undefined)?.section_type;
    if (sectionType !== 'custom') {
      return (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                Section Design
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}
              >
                ×
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              This section has a unique hand-crafted design that cannot be changed.
            </p>
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
  }

  function handleApply() {
    if (selected === currentVariant) { onClose(); return; }
    startTransition(async () => {
      await changePageTemplate(pageId, selected);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--color-surface)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Change Design
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'var(--color-background)', color: 'var(--color-text-secondary)' }}
          >
            ×
          </button>
        </div>

        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Pick a design for this {template.label} page.
        </p>

        <div className="flex flex-col gap-2">
          {template.variants.map((v) => {
            const isSelected = v.id === selected;
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className="flex items-start gap-3 p-3 rounded-xl border text-left transition"
                style={{
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isSelected ? 'var(--color-primary-light)' : 'var(--color-background)',
                }}
              >
                <span
                  className="mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                  }}
                />
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {v.label}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                    {v.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition hover:bg-border/30"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            {isPending ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}
