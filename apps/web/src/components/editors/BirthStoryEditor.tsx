'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage } from '@/app/actions/pages';

interface Props {
  onClose: () => void;
}

export function BirthStoryEditor({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    date_of_birth: '',
    time_of_birth: '',
    weight_kg: '',
    height_cm: '',
    hospital: '',
    story_text: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.date_of_birth || !form.weight_kg || !form.height_cm) {
      setError('Date of birth, weight, and height are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const page = await createPage('birth_story', form.date_of_birth, {
        date_of_birth: form.date_of_birth,
        time_of_birth: form.time_of_birth || undefined,
        weight_kg: parseFloat(form.weight_kg),
        height_cm: parseFloat(form.height_cm),
        hospital: form.hospital || undefined,
        story_text: form.story_text || undefined,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Date of Birth *
          </label>
          <input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Time of Birth
          </label>
          <input type="time" value={form.time_of_birth} onChange={(e) => set('time_of_birth', e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Weight (kg) *
          </label>
          <input type="number" step="0.01" min="0" max="20" value={form.weight_kg}
            onChange={(e) => set('weight_kg', e.target.value)}
            placeholder="3.50"
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Height (cm) *
          </label>
          <input type="number" step="0.1" min="0" max="100" value={form.height_cm}
            onChange={(e) => set('height_cm', e.target.value)}
            placeholder="50.5"
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Hospital / Birthplace
        </label>
        <input type="text" value={form.hospital} onChange={(e) => set('hospital', e.target.value)}
          placeholder="e.g., St. Mary's Hospital"
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Birth Story
        </label>
        <textarea
          value={form.story_text}
          onChange={(e) => set('story_text', e.target.value)}
          rows={4}
          placeholder="Write the story of your little one's arrival…"
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
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
