'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background p-4">
      <div className="text-6xl">😔</div>
      <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>
        Something went wrong
      </h2>
      <p className="text-text-secondary text-sm max-w-sm text-center">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-xl text-white font-semibold transition hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          Try again
        </button>
        <a
          href="/book"
          className="px-6 py-2.5 rounded-xl font-semibold border transition hover:bg-border/30"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Back to Book
        </a>
      </div>
    </div>
  );
}
