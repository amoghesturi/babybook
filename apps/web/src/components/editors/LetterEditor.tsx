'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage } from '@/app/actions/pages';
import { TiptapEditor } from './TiptapEditor';
import type { JSONContent } from '@tiptap/core';

interface Props {
  onClose: () => void;
}

export function LetterEditor({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<JSONContent>({ type: 'doc', content: [{ type: 'paragraph' }] });

  const [form, setForm] = useState({
    author_name: '',
    reveal_date: '',
    pageDate: new Date().toISOString().split('T')[0],
  });

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.author_name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const page = await createPage('letter', form.pageDate, {
        author_name: form.author_name,
        content_tiptap: content,
        reveal_date: form.reveal_date || undefined,
      });
      onClose();
      router.push(`/book/${page.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Your Name (Author) *
        </label>
        <input
          type="text"
          value={form.author_name}
          onChange={(e) => set('author_name', e.target.value)}
          placeholder="e.g., Mom"
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Letter Content
        </label>
        <TiptapEditor
          value={content}
          onChange={setContent}
          placeholder="Write your letter…"
          minHeight="180px"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Page Date
          </label>
          <input
            type="date"
            value={form.pageDate}
            onChange={(e) => set('pageDate', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Reveal Date (optional)
          </label>
          <input
            type="date"
            value={form.reveal_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => set('reveal_date', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Viewers see a wax seal until this date
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onClose}
          className="flex-1 py-2.5 border rounded-xl text-sm font-medium transition hover:bg-border/30"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}>
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
      </div>
    </div>
  );
}
