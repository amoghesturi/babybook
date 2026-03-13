'use client';

import { useState, useTransition } from 'react';
import { logMeasurement } from '@/app/actions/growth';

interface Props {
  onClose: () => void;
}

export function LogMeasurementModal({ onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const weightNum = weight ? parseFloat(weight) : undefined;
    const heightNum = height ? parseFloat(height) : undefined;
    const headNum = head ? parseFloat(head) : undefined;

    if (!weightNum && !heightNum && !headNum) {
      setError('Please enter at least one measurement.');
      return;
    }

    startTransition(async () => {
      try {
        await logMeasurement(date, weightNum, heightNum, headNum);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            Log Measurement
          </h2>
          <button
            onClick={onClose}
            className="text-xl leading-none opacity-50 hover:opacity-100 transition"
            style={{ color: 'var(--color-text-primary)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today}
              required
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.001"
              placeholder="e.g. 5.420"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Height (cm)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              min="0"
              step="0.01"
              placeholder="e.g. 58.50"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Head circumference (cm)
            </label>
            <input
              type="number"
              value={head}
              onChange={(e) => setHead(e.target.value)}
              min="0"
              step="0.01"
              placeholder="e.g. 38.00"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-error, #ef4444)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ background: 'var(--color-primary)' }}
          >
            {isPending ? 'Saving…' : 'Save Measurement'}
          </button>
        </form>
      </div>
    </div>
  );
}
