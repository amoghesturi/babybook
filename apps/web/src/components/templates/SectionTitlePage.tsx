import type { SectionTitleContent, SectionTitleVariant } from '@babybook/shared';

interface Props {
  content: SectionTitleContent;
  variant?: SectionTitleVariant;
}

// ── Pregnancy ─────────────────────────────────────────────────────────────────
function SectionPregnancy({ name }: { name: string }) {
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        background: `radial-gradient(ellipse 90% 70% at 50% 40%, var(--color-primary-light) 0%, var(--color-secondary-light) 55%, var(--color-surface) 100%)`,
      }}
    >
      {/* Scattered stars/moons */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {[
          { cx: 60,  cy: 80,  r: 3  },
          { cx: 320, cy: 50,  r: 2  },
          { cx: 260, cy: 130, r: 1.5},
          { cx: 80,  cy: 300, r: 2.5},
          { cx: 340, cy: 280, r: 2  },
          { cx: 190, cy: 480, r: 1.5},
          { cx: 40,  cy: 450, r: 3  },
          { cx: 330, cy: 440, r: 1.5},
        ].map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="var(--color-primary)" opacity="0.25" />
        ))}
        <path d="M290 70 Q296 58 304 70 Q296 82 290 70Z" fill="var(--color-secondary)" opacity="0.3" />
        <path d="M55 400 Q61 388 69 400 Q61 412 55 400Z" fill="var(--color-primary)" opacity="0.2" />
      </svg>

      {/* Soft glow circle behind emoji */}
      <div
        className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center mb-6"
        style={{
          background: `radial-gradient(circle, var(--color-primary-light) 0%, transparent 70%)`,
          boxShadow: '0 0 40px 10px var(--color-primary-light)',
        }}
      >
        <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>🤰</span>
      </div>

      <div className="relative z-10 px-10 flex flex-col items-center">
        <p
          className="text-xs font-semibold uppercase tracking-[0.4em] mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Chapter
        </p>
        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2.4rem, 8vw, 4rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {name}
        </h1>
        <p
          className="font-handwritten text-xl mt-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The journey before baby arrived
        </p>
      </div>
    </div>
  );
}

// ── Birth ─────────────────────────────────────────────────────────────────────
function SectionBirth({ name }: { name: string }) {
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        background: `linear-gradient(160deg, var(--color-primary-light) 0%, var(--color-surface) 50%, var(--color-secondary-light) 100%)`,
      }}
    >
      {/* Ribbon / confetti shapes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <rect x="30" y="60"  width="8"  height="22" rx="3" fill="var(--color-primary)"   opacity="0.25" transform="rotate(15 34 71)" />
        <rect x="320" y="80" width="6"  height="18" rx="2" fill="var(--color-secondary)"  opacity="0.3"  transform="rotate(-20 323 89)" />
        <rect x="60" y="420" width="10" height="26" rx="3" fill="var(--color-secondary)"  opacity="0.2"  transform="rotate(8 65 433)" />
        <rect x="290" y="400" width="7" height="20" rx="2" fill="var(--color-primary)"   opacity="0.25" transform="rotate(-12 293 410)" />
        <circle cx="200" cy="50"  r="5" fill="var(--color-primary)"  opacity="0.2" />
        <circle cx="80"  cy="180" r="4" fill="var(--color-secondary)" opacity="0.2" />
        <circle cx="330" cy="320" r="5" fill="var(--color-primary)"  opacity="0.15" />
        <circle cx="150" cy="480" r="4" fill="var(--color-secondary)" opacity="0.2" />
        <path d="M250 100 Q270 80 290 100 Q270 120 250 100Z" fill="var(--color-primary)" opacity="0.2" />
        <path d="M40 250 Q56 232 72 250 Q56 268 40 250Z" fill="var(--color-secondary)" opacity="0.2" />
      </svg>

      <div className="relative z-10 flex flex-col items-center px-10">
        <span style={{ fontSize: '3.5rem', lineHeight: 1 }} className="mb-6">👶</span>

        {/* Gold-tinted banner */}
        <div
          className="px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-4"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: 'white',
          }}
        >
          Chapter
        </div>

        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2.6rem, 8vw, 4.2rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {name}
        </h1>

        <p
          className="font-handwritten text-xl mt-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The arrival day
        </p>
      </div>
    </div>
  );
}

// ── Newborn 0–3 ───────────────────────────────────────────────────────────────
function SectionNewborn({ name }: { name: string }) {
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Very soft bg wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 50% 60%, var(--color-secondary-light) 0%, transparent 70%)`,
          opacity: 0.6,
        }}
      />

      {/* Footprint trail SVG */}
      <svg
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        width="120" height="200" viewBox="0 0 120 200" fill="none"
        aria-hidden="true"
        style={{ opacity: 0.12 }}
      >
        {/* left foot */}
        <ellipse cx="40" cy="180" rx="14" ry="18" fill="var(--color-primary)" />
        <ellipse cx="28" cy="163" rx="5" ry="4" fill="var(--color-primary)" />
        <ellipse cx="36" cy="159" rx="4" ry="3.5" fill="var(--color-primary)" />
        <ellipse cx="44" cy="158" rx="4" ry="3.5" fill="var(--color-primary)" />
        <ellipse cx="52" cy="161" rx="4" ry="3.5" fill="var(--color-primary)" />
        {/* right foot */}
        <ellipse cx="80" cy="120" rx="14" ry="18" fill="var(--color-secondary)" />
        <ellipse cx="68" cy="103" rx="5" ry="4" fill="var(--color-secondary)" />
        <ellipse cx="76" cy="99" rx="4" ry="3.5" fill="var(--color-secondary)" />
        <ellipse cx="84" cy="98" rx="4" ry="3.5" fill="var(--color-secondary)" />
        <ellipse cx="92" cy="101" rx="4" ry="3.5" fill="var(--color-secondary)" />
        {/* left foot */}
        <ellipse cx="40" cy="60" rx="14" ry="18" fill="var(--color-primary)" />
        <ellipse cx="28" cy="43" rx="5" ry="4" fill="var(--color-primary)" />
        <ellipse cx="36" cy="39" rx="4" ry="3.5" fill="var(--color-primary)" />
        <ellipse cx="44" cy="38" rx="4" ry="3.5" fill="var(--color-primary)" />
        <ellipse cx="52" cy="41" rx="4" ry="3.5" fill="var(--color-primary)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center px-10">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'var(--color-primary-light)' }}
        >
          <span style={{ fontSize: '3rem', lineHeight: 1 }}>🐣</span>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Chapter
        </p>

        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2rem, 7vw, 3.4rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {name}
        </h1>

        <p
          className="font-handwritten text-xl mt-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The first three months
        </p>
      </div>
    </div>
  );
}

// ── First 6 Months ────────────────────────────────────────────────────────────
function SectionFirst6({ name }: { name: string }) {
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Wavy hills at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 400 120" preserveAspectRatio="none"
        style={{ height: '130px' }}
        aria-hidden="true"
      >
        <path
          d="M0 80 Q50 50 100 70 Q150 90 200 60 Q250 30 300 60 Q350 90 400 70 L400 120 L0 120Z"
          fill="var(--color-secondary-light)"
          opacity="0.5"
        />
        <path
          d="M0 100 Q60 75 120 90 Q180 105 240 80 Q300 55 360 80 Q380 88 400 85 L400 120 L0 120Z"
          fill="var(--color-primary-light)"
          opacity="0.5"
        />
      </svg>

      <div className="relative z-10 flex flex-col items-center px-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
          }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🌱</span>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Months 4–6
        </p>

        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2rem, 7vw, 3.4rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {name}
        </h1>

        {/* Growth-themed progress bar */}
        <div className="mt-6 w-48 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: '50%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Months 4–6</p>
      </div>
    </div>
  );
}

// ── Second 6 Months ───────────────────────────────────────────────────────────
function SectionSecond6({ name }: { name: string }) {
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Diagonal stripe accents */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            var(--color-primary-light) 40px,
            var(--color-primary-light) 42px
          )`,
          opacity: 0.25,
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'var(--color-primary-light)' }}
        >
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🏃</span>
        </div>

        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Months 7–12
        </p>

        <h1
          className="font-display font-bold leading-none"
          style={{
            fontSize: 'clamp(2rem, 7vw, 3.4rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
          }}
        >
          {name}
        </h1>

        {/* Progress bar */}
        <div className="mt-6 w-48 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>Months 7–12</p>
      </div>
    </div>
  );
}

// ── Toddler ───────────────────────────────────────────────────────────────────
function SectionToddler({ name }: { name: string }) {
  const dots = [
    { x: 30,  y: 60,  r: 12, op: 0.18 },
    { x: 330, y: 80,  r: 18, op: 0.12 },
    { x: 60,  y: 420, r: 14, op: 0.15 },
    { x: 310, y: 400, r: 20, op: 0.12 },
    { x: 180, y: 30,  r: 8,  op: 0.2  },
    { x: 200, y: 500, r: 10, op: 0.15 },
  ];

  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Scattered dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.x} cy={d.y} r={d.r}
            fill={i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'}
            opacity={d.op}
          />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center px-10">
        <span style={{ fontSize: '3.5rem', lineHeight: 1 }} className="mb-6">🧒</span>

        <p
          className="text-xs font-semibold uppercase tracking-[0.35em] mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Chapter
        </p>

        <h1
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(2.4rem, 8vw, 4.2rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {name}
        </h1>

        <p
          className="font-handwritten text-xl mt-4"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Months 13 through 24
        </p>
      </div>
    </div>
  );
}

// ── Custom: Elegant ───────────────────────────────────────────────────────────
function SectionElegant({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: 'white' }}
    >
      <div className="flex flex-col items-center px-12 gap-6">
        {/* Decorative rule above */}
        <div className="flex items-center gap-4 w-full max-w-xs">
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>◆</span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Monogram circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
          }}
        >
          <span
            className="font-display font-bold"
            style={{ fontSize: '2rem', lineHeight: 1 }}
          >
            {initial}
          </span>
        </div>

        <h1
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(2rem, 7vw, 3.2rem)',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
          }}
        >
          {name}
        </h1>

        {/* Decorative rule below */}
        <div className="flex items-center gap-4 w-full max-w-xs">
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>◆</span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
    </div>
  );
}

// ── Custom: Playful ───────────────────────────────────────────────────────────
function SectionPlayful({ name }: { name: string }) {
  const confetti = [
    { x: 40,  y: 50,  r: 14, color: 'var(--color-primary)'   },
    { x: 320, y: 70,  r: 18, color: 'var(--color-secondary)'  },
    { x: 60,  y: 430, r: 12, color: 'var(--color-secondary)'  },
    { x: 300, y: 410, r: 16, color: 'var(--color-primary)'   },
    { x: 190, y: 30,  r: 10, color: 'var(--color-primary)'   },
    { x: 210, y: 510, r: 12, color: 'var(--color-secondary)'  },
    { x: 360, y: 250, r: 8,  color: 'var(--color-primary)'   },
    { x: 10,  y: 250, r: 10, color: 'var(--color-secondary)'  },
  ];

  return (
    <div
      className="relative min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden flex flex-col items-center justify-center text-center"
      style={{
        background: `linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-surface) 50%, var(--color-secondary-light) 100%)`,
      }}
    >
      {/* Colorful circle confetti */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        {confetti.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.color} opacity="0.25" />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center px-10 gap-4">
        {/* Pill title label */}
        <div
          className="px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.25em]"
          style={{
            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
            color: 'white',
          }}
        >
          Section
        </div>

        <h1
          className="font-display font-bold"
          style={{
            fontSize: 'clamp(2.4rem, 9vw, 4.4rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {name}
        </h1>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function SectionTitlePage({ content, variant = 'default' }: Props) {
  const { section_type, section_name } = content;

  if (variant === 'elegant') return <SectionElegant name={section_name} />;
  if (variant === 'playful') return <SectionPlayful name={section_name} />;

  // Preset section designs (variant === 'default')
  switch (section_type) {
    case 'pregnancy':      return <SectionPregnancy name={section_name} />;
    case 'birth':          return <SectionBirth     name={section_name} />;
    case 'newborn_0_3':    return <SectionNewborn   name={section_name} />;
    case 'first_6_months': return <SectionFirst6    name={section_name} />;
    case 'second_6_months':return <SectionSecond6   name={section_name} />;
    case 'toddler':        return <SectionToddler   name={section_name} />;
    default:               return <SectionElegant   name={section_name} />;
  }
}
