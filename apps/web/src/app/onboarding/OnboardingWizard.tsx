'use client';

import { useState } from 'react';
import { completeOnboarding } from '@/app/actions/onboarding';

type Step = 'family' | 'child' | 'cover';

interface Props {
  userId: string;
}

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

  const steps: Step[] = ['family', 'child', 'cover'];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding({
        familyName,
        childName,
        dateOfBirth,
        gender,
        bookTitle,
        subtitle,
      });
      // completeOnboarding redirects on success — no return value needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Step {stepIndex + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium capitalize" style={{ color: 'var(--color-primary)' }}>
            {step}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--color-primary)' }}
          />
        </div>
      </div>

      <div className="rounded-2xl shadow-page p-8" style={{ background: 'var(--color-surface)' }}>

        {/* ── Step 1: Family ── */}
        {step === 'family' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">👨‍👩‍👧</div>
              <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Your Family
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Give your family a name — this labels your baby book
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Family Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g., The Johnson Family"
                autoFocus
                className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
              />
            </div>
            <button
              onClick={() => setStep('child')}
              disabled={!familyName.trim()}
              className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-40"
              style={{ background: 'var(--color-primary)' }}
            >
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Child ── */}
        {step === 'child' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">👶</div>
              <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Your Little One
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Tell us about the star of this story
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Baby's Name
                </label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g., Lily"
                  autoFocus
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Gender (optional)
                </label>
                <div className="flex gap-3">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g === gender ? '' : g)}
                      className="flex-1 py-2 rounded-xl border text-sm font-medium transition capitalize"
                      style={{
                        borderColor: gender === g ? 'var(--color-primary)' : 'var(--color-border)',
                        background: gender === g ? 'var(--color-primary-light)' : undefined,
                        color: gender === g ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {g === 'male' ? '👦' : g === 'female' ? '👧' : '🌈'} {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('family')}
                className="flex-1 py-3 border rounded-xl font-semibold transition hover:opacity-70"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('cover')}
                disabled={!childName.trim() || !dateOfBirth}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition disabled:opacity-40"
                style={{ background: 'var(--color-primary)' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Cover ── */}
        {step === 'cover' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-2">📖</div>
              <h2 className="text-2xl font-display font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Name Your Book
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                You can always change this later
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Book Title
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder={`${childName}'s Baby Book`}
                  autoFocus
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                  Subtitle (optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={`The story of ${childName}`}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('child')}
                disabled={loading}
                className="flex-1 py-3 border rounded-xl font-semibold transition hover:opacity-70 disabled:opacity-40"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                {loading ? 'Creating…' : '🎉 Create My Book!'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
