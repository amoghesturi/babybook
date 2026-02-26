'use client';

import { useState } from 'react';
import { completeOnboarding } from '@/app/actions/onboarding';
import { THEMES, DEFAULT_THEME_ID } from '@babybook/shared';
import type { ThemeId } from '@babybook/shared';
import { useTheme } from '@/lib/hooks/useTheme';

type Step = 'family' | 'child' | 'cover' | 'theme';
const STEPS: Step[] = ['family', 'child', 'cover', 'theme'];

const STEP_META: Record<Step, { icon: string; label: string }> = {
  family: { icon: '🏡', label: 'Family'  },
  child:  { icon: '👶', label: 'Baby'    },
  cover:  { icon: '📖', label: 'Book'    },
  theme:  { icon: '🎨', label: 'Style'   },
};

interface Props { userId: string }

export function OnboardingWizard({ userId: _ }: Props) {
  const [step, setStep] = useState<Step>('family');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [familyName, setFamilyName] = useState('');
  const [childName, setChildName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [bookTitle, setBookTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME_ID);

  const { applyTheme } = useTheme();

  const stepIndex = STEPS.indexOf(step);

  function handleThemeSelect(id: ThemeId) {
    setThemeId(id);
    applyTheme(id);
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding({ familyName, childName, dateOfBirth, gender, bookTitle, subtitle, themeId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  // Shared input style helper
  function inputClass() {
    return 'w-full px-4 py-3 border rounded-xl text-sm transition bg-background';
  }
  function inputStyle() {
    return {
      borderColor: 'var(--color-border)',
      color: 'var(--color-text-primary)',
      outline: 'none' as const,
    };
  }
  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'var(--color-primary)';
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = 'var(--color-border)';
  }

  return (
    <div className="w-full max-w-lg">

      {/* ── Step indicator ── */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={{
                    background: active ? 'var(--color-primary)' : done ? 'var(--color-primary-light)' : 'var(--color-border)',
                    color: active ? 'white' : done ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                    boxShadow: active ? '0 0 0 4px var(--color-primary-light)' : 'none',
                  }}
                >
                  {done ? '✓' : STEP_META[s].icon}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                >
                  {STEP_META[s].label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="w-16 h-0.5 mx-1 mb-5 transition-all duration-500"
                  style={{ background: i < stepIndex ? 'var(--color-primary-light)' : 'var(--color-border)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Card ── */}
      <div
        className="rounded-3xl shadow-page overflow-hidden"
        style={{ background: 'var(--color-surface)' }}
      >

        {/* Step 1: Family */}
        {step === 'family' && (
          <div>
            <div
              className="px-8 pt-10 pb-8"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}
            >
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Step 1 of 4</p>
              <h2 className="font-display font-bold text-white text-3xl leading-tight">
                Let&apos;s start with<br />your family
              </h2>
              <p className="text-white/65 text-sm mt-2">
                This will be the name of your baby book.
              </p>
            </div>

            <div className="px-8 py-8 space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Family Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="e.g., The Johnson Family"
                  autoFocus
                  className={inputClass()}
                  style={inputStyle()}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <button
                onClick={() => setStep('child')}
                disabled={!familyName.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Child */}
        {step === 'child' && (
          <div>
            <div
              className="px-8 pt-10 pb-8"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}
            >
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Step 2 of 4</p>
              <h2 className="font-display font-bold text-white text-3xl leading-tight">
                Tell us about<br />your little one
              </h2>
              <p className="text-white/65 text-sm mt-2">
                They&apos;re the star of this story.
              </p>
            </div>

            <div className="px-8 py-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Baby&apos;s Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g., Lily"
                  autoFocus
                  className={inputClass()}
                  style={inputStyle()}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={inputClass()}
                  style={inputStyle()}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Gender <span className="normal-case font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => {
                    const labels = { male: '👦 Boy', female: '👧 Girl', other: '🌈 Other' };
                    const selected = gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g === gender ? '' : g)}
                        className="py-2.5 rounded-xl border text-sm font-medium transition"
                        style={{
                          borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                          background: selected ? 'var(--color-primary-light)' : 'var(--color-background)',
                          color: selected ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {labels[g]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('family')}
                  className="flex-1 py-3 border rounded-xl text-sm font-medium transition"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('cover')}
                  disabled={!childName.trim() || !dateOfBirth}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Cover */}
        {step === 'cover' && (
          <div>
            <div
              className="px-8 pt-10 pb-8"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}
            >
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Step 3 of 4</p>
              <h2 className="font-display font-bold text-white text-3xl leading-tight">
                Name<br />your book
              </h2>
              <p className="text-white/65 text-sm mt-2">
                You can always change this later.
              </p>
            </div>

            <div className="px-8 py-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Book Title
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder={childName ? `${childName}'s Baby Book` : 'My Baby Book'}
                  autoFocus
                  className={inputClass()}
                  style={inputStyle()}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Subtitle <span className="normal-case font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={childName ? `The story of ${childName}` : 'A family story'}
                  className={inputClass()}
                  style={inputStyle()}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('child')}
                  className="flex-1 py-3 border rounded-xl text-sm font-medium transition"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('theme')}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Theme */}
        {step === 'theme' && (
          <div>
            <div
              className="px-8 pt-10 pb-8"
              style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}
            >
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-2">Step 4 of 4</p>
              <h2 className="font-display font-bold text-white text-3xl leading-tight">
                Pick your<br />style
              </h2>
              <p className="text-white/65 text-sm mt-2">
                Choose a colour theme — you can change it any time.
              </p>
            </div>

            <div className="px-8 py-8 space-y-5">
              <div className="grid grid-cols-1 gap-2">
                {THEMES.map((theme) => {
                  const selected = themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleThemeSelect(theme.id)}
                      className="flex items-center gap-4 p-4 rounded-2xl border text-left transition"
                      style={{
                        borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                        borderWidth: selected ? '2px' : '1px',
                        background: selected ? 'var(--color-primary-light)' : 'var(--color-background)',
                      }}
                    >
                      {/* Colour swatch */}
                      <ThemeSwatch themeId={theme.id} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                          {theme.name}
                        </div>
                        <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                          {theme.description}
                        </div>
                      </div>
                      {selected && (
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-primary)' }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep('cover')}
                  disabled={loading}
                  className="flex-1 py-3 border rounded-xl text-sm font-medium transition disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={loading}
                  className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-secondary))' }}
                >
                  {loading ? 'Creating your book…' : 'Create My Book 🎉'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Small colour swatch for each theme option */
function ThemeSwatch({ themeId }: { themeId: string }) {
  const swatches: Record<string, [string, string]> = {
    'meadow':        ['#3d7a58', '#c47c2a'],
    'ocean':         ['#0891b2', '#f47c5d'],
    'night-sky':     ['#8b5cf6', '#f59e0b'],
    'autumn-leaves': ['#d97706', '#dc2626'],
    'jungle':        ['#4a8c3f', '#c9a227'],
    'cotton-candy':  ['#e879b0', '#b78ad5'],
  };
  const [a, b] = swatches[themeId] ?? ['#888', '#aaa'];
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden flex">
      <div style={{ flex: 1, background: a }} />
      <div style={{ flex: 1, background: b }} />
    </div>
  );
}
