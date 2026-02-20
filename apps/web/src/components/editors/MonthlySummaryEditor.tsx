'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage } from '@/app/actions/pages';

interface Props {
  onClose: () => void;
}

export function MonthlySummaryEditor({ onClose }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const defaultYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [form, setForm] = useState({
    year_month: defaultYearMonth,
    weight_kg: '',
    height_cm: '',
    notes: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.year_month) {
      setError('Please select a month.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const pageDate = `${form.year_month}-01`;
      const page = await createPage('monthly_summary', pageDate, {
        year_month: form.year_month,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        notes: form.notes || undefined,
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
          Month *
        </label>
        <input
          type="month"
          value={form.year_month}
          max={defaultYearMonth}
          onChange={(e) => set('year_month', e.target.value)}
          className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="50"
            value={form.weight_kg}
            onChange={(e) => set('weight_kg', e.target.value)}
            placeholder="7.5"
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Height (cm)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="200"
            value={form.height_cm}
            onChange={(e) => set('height_cm', e.target.value)}
            placeholder="68"
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Notes / Highlights
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={4}
          placeholder="What made this month special?…"
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
