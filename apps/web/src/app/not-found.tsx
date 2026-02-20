import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background p-4">
      <div className="text-6xl">📖</div>
      <h1 className="text-2xl font-display font-bold" style={{ color: 'var(--color-primary)' }}>
        Page not found
      </h1>
      <p className="text-text-secondary text-center max-w-sm">
        This page doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <Link
        href="/book"
        className="px-6 py-3 rounded-xl text-white font-semibold transition hover:opacity-90"
        style={{ background: 'var(--color-primary)' }}
      >
        Back to Book
      </Link>
    </div>
  );
}
