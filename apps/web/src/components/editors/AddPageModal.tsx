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
  sectionId?: string;
}

type Step = 'type' | 'variant' | 'editor';

export function AddPageModal({ pageId: _, onClose, sectionId }: Props) {
  const [step, setStep] = useState<Step>('type');
  const [selectedType, setSelectedType] = useState<PageType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSelectType(type: PageType) {
    setSelectedType(type);
    const template = PAGE_TEMPLATES.find(t => t.type === type);
    if (template && template.variants.length > 1) {
      setSelectedVariant(template.defaultVariant);
      setStep('variant');
    } else {
      setSelectedVariant(template?.defaultVariant ?? null);
      setStep('editor');
    }
  }

  function handleSelectVariant(variantId: string) {
    setSelectedVariant(variantId);
    setStep('editor');
  }

  function handleBack() {
    if (step === 'editor') {
      const template = PAGE_TEMPLATES.find(t => t.type === selectedType);
      if (template && template.variants.length > 1) {
        setStep('variant');
      } else {
        setStep('type');
        setSelectedType(null);
        setSelectedVariant(null);
      }
    } else if (step === 'variant') {
      setStep('type');
      setSelectedType(null);
      setSelectedVariant(null);
    }
  }

  const addableTypes = PAGE_TEMPLATES.filter(t => t.type !== 'cover');
  const selectedTemplate = PAGE_TEMPLATES.find(t => t.type === selectedType);

  const stepTitle =
    step === 'type' ? 'Add a Page' :
    step === 'variant' ? `Choose Style — ${selectedTemplate?.label}` :
    selectedTemplate?.label ?? '';

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
          {step !== 'type' && (
            <button
              onClick={handleBack}
              className="text-text-secondary hover:text-text-primary transition text-sm"
            >
              ←
            </button>
          )}
          <h2 className="font-display font-bold text-xl flex-1" style={{ color: 'var(--color-text-primary)' }}>
            {stepTitle}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition text-xl leading-none">
            ×
          </button>
        </div>

        {/* Step 1: Pick page type */}
        {step === 'type' && (
          <div className="p-4 grid grid-cols-2 gap-3">
            {addableTypes.map((template) => (
              <button
                key={template.type}
                onClick={() => handleSelectType(template.type)}
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
        )}

        {/* Step 2: Pick variant */}
        {step === 'variant' && selectedTemplate && (
          <div className="p-4 space-y-3">
            <p className="text-sm px-2" style={{ color: 'var(--color-text-secondary)' }}>
              Choose the visual style for this {selectedTemplate.label.toLowerCase()}:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {selectedTemplate.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border text-left transition hover:shadow-md"
                  style={{
                    borderColor: selectedVariant === v.id ? 'var(--color-primary)' : 'var(--color-border)',
                    borderWidth: selectedVariant === v.id ? '2px' : '1px',
                    background: selectedVariant === v.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                  }}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {v.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {v.description}
                    </div>
                  </div>
                  {selectedVariant === v.id && (
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Editor */}
        {step === 'editor' && selectedType && (
          <div className="p-6">
            {selectedType === 'birth_story' && (
              <BirthStoryEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
            {selectedType === 'milestone' && (
              <MilestoneEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
            {selectedType === 'photo_spread' && (
              <PhotoSpreadEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
            {selectedType === 'journal' && (
              <JournalEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
            {selectedType === 'letter' && (
              <LetterEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
            {selectedType === 'monthly_summary' && (
              <MonthlySummaryEditor onClose={onClose} templateVariant={selectedVariant ?? undefined} sectionId={sectionId} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
