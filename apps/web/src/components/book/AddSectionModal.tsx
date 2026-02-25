'use client';

import { useState } from 'react';
import { SECTION_TYPES } from '@babybook/shared';
import type { SectionType } from '@babybook/shared';
import { createSection } from '@/app/actions/sections';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function AddSectionModal({ onClose, onCreated }: Props) {
  const [selected, setSelected] = useState<SectionType | null>(null);
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const meta = SECTION_TYPES.find((s) => s.id === selected);

  async function handleCreate() {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await createSection(selected, selected === 'custom' ? customName : undefined);
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create section');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Add Section
          </h2>
          <button onClick={onClose} className="text-xl leading-none" style={{ color: 'var(--color-text-secondary)' }}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* Section type grid */}
          {SECTION_TYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelected(s.id); setCustomName(''); }}
              className="w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition"
              style={{
                borderColor: selected === s.id ? 'var(--color-primary)' : 'var(--color-border)',
                background: selected === s.id ? 'var(--color-primary-light)' : undefined,
              }}
            >
              <span className="text-2xl flex-shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{s.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{s.description}</p>
                {s.presetPages.length > 0 && (
                  <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--color-text-secondary)' }}>
                    Creates {s.presetPages.length} preset page{s.presetPages.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {selected === s.id && (
                <span className="flex-shrink-0 text-lg" style={{ color: 'var(--color-primary)' }}>✓</span>
              )}
            </button>
          ))}

          {/* Custom name input */}
          {selected === 'custom' && (
            <div className="pt-1">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Section Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g., Holidays"
                autoFocus
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
          )}

          {/* Preset page preview */}
          {meta && meta.presetPages.length > 0 && (
            <div
              className="rounded-xl p-3 space-y-1"
              style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Preset pages
              </p>
              {meta.presetPages.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="opacity-40">·</span>
                  <span>{p.description}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border rounded-xl text-sm font-medium transition"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selected || (selected === 'custom' && !customName.trim()) || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-50"
            style={{ background: 'var(--color-primary)' }}
          >
            {saving ? 'Creating…' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
