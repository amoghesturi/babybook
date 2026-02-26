import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">

      {/* ── Brand panel — stacks on top (mobile), left column (desktop) ── */}
      <div
        className="flex flex-col lg:w-[55%] lg:justify-between p-8 lg:p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #1a3d2b 0%, #3d7a58 55%, #c47c2a 100%)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg viewBox="0 0 600 700" fill="none" className="absolute -right-20 -bottom-20 w-[480px] opacity-10">
            <circle cx="300" cy="350" r="280" fill="white" />
            <circle cx="300" cy="350" r="200" fill="white" />
            <circle cx="300" cy="350" r="120" fill="white" />
          </svg>
          <svg viewBox="0 0 200 200" fill="none" className="absolute top-16 right-12 w-32 opacity-10">
            <path d="M100 10 L110 80 L180 80 L120 120 L140 190 L100 150 L60 190 L80 120 L20 80 L90 80 Z" fill="white"/>
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <span className="font-display font-bold text-2xl text-white tracking-wide">
              BabyBook
            </span>
          </div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-6 mt-8 lg:mt-0">
          <div className="space-y-3 lg:space-y-4">
            <h1
              className="font-display font-bold text-white leading-tight text-2xl"
              style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)' }}
            >
              Cherish every<br />moment, forever.
            </h1>
            <p className="text-white/70 text-sm lg:text-lg leading-relaxed max-w-sm">
              A beautiful baby book that grows with your family — capture firsts, share milestones, and create memories that last a lifetime.
            </p>
          </div>

          <ul className="space-y-2 lg:space-y-3">
            {[
              'Beautiful, customisable page templates',
              'Share with family, grandparents & friends',
              'Voice notes, photos, and videos',
            ].map((f) => (
              <li key={f} className="flex items-start gap-3 text-white/80 text-sm">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom quote — desktop only */}
        <p className="hidden lg:block relative z-10 text-white/40 text-xs italic mt-8">
          &ldquo;The days are long but the years are short.&rdquo;
        </p>
      </div>

      {/* ── Form panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--color-text-primary)' }}>
              Welcome back
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Sign in to your family&apos;s book
            </p>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm border"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <LoginForm />
          </div>
        </div>
      </div>

    </div>
  );
}
