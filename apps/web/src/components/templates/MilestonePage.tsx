'use client';

import { useEffect, useState } from 'react';
import { storageUrl } from '@/lib/storageUrl';
import type { MilestoneContent } from '@babybook/shared';
import { MILESTONE_TYPES, MILESTONE_CATEGORIES } from '@babybook/shared';

interface Props {
  content: MilestoneContent;
  childName: string;
  childDob: string;
  pageDate: string;
}

function getAgeAtMilestone(dob: string, achieved: string): string {
  const birth = new Date(dob);
  const achieved_date = new Date(achieved);
  const diffMs = achieved_date.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30.44);
  const years = Math.floor(months / 12);
  if (days < 30) return `${days} days old`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} old`;
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''} old`;
  return `${years}y ${remainingMonths}m old`;
}

function getMilestoneEmoji(milestoneName: string, category: string): string {
  const found = MILESTONE_TYPES.find(
    (m) => m.name.toLowerCase() === milestoneName.toLowerCase()
  );
  if (found) return found.emoji;
  const catFound = MILESTONE_CATEGORIES.find((c) => c.id === category);
  return catFound?.emoji ?? '⭐';
}

export function MilestonePage({ content, childName, childDob, pageDate }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const emoji = getMilestoneEmoji(content.milestone_name, content.category);
  const ageLabel = childDob
    ? getAgeAtMilestone(childDob, content.achieved_at || pageDate)
    : '';

  useEffect(() => {
    const key = `milestone-confetti-seen-${content.milestone_name}`;
    if (!sessionStorage.getItem(key)) {
      setShowConfetti(true);
      sessionStorage.setItem(key, '1');
    }
  }, [content.milestone_name]);

  const catInfo = MILESTONE_CATEGORIES.find((c) => c.id === content.category);

  return (
    <div
      className="min-h-[500px] md:min-h-[600px] w-full rounded-page overflow-hidden relative flex flex-col items-center justify-center text-center"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, var(--color-primary) 2px, transparent 2px), radial-gradient(circle at 75% 75%, var(--color-secondary) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Confetti burst (client-side) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-8px',
                background: ['#e879b0', '#b78ad5', '#ff9bc7', '#c9a227', '#4a8c3f'][i % 5],
                animation: `fall-${i} ${1 + Math.random() * 2}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Category badge */}
      <div
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide"
        style={{
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
        }}
      >
        {catInfo?.emoji} {catInfo?.label}
      </div>

      {/* Age badge */}
      {ageLabel && (
        <div
          className="absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: 'var(--color-secondary-light)', color: 'var(--color-primary-dark)' }}
        >
          {ageLabel}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 px-8 py-12">
        {/* Big emoji */}
        <div className="text-7xl mb-6 drop-shadow-sm">{emoji}</div>

        {/* Ribbon badge */}
        <div className="relative inline-block mb-4">
          <div
            className="px-8 py-3 rounded-full font-display font-bold text-2xl md:text-3xl shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              color: 'white',
            }}
          >
            {content.milestone_name}
          </div>
          {/* Ribbon tails */}
          <div className="absolute -bottom-3 left-4 w-0 h-0"
            style={{ borderLeft: '12px solid transparent', borderRight: '8px solid transparent', borderTop: '14px solid var(--color-primary-dark)' }} />
          <div className="absolute -bottom-3 right-4 w-0 h-0"
            style={{ borderLeft: '8px solid transparent', borderRight: '12px solid transparent', borderTop: '14px solid var(--color-primary-dark)' }} />
        </div>

        <p className="text-lg font-handwritten mt-8" style={{ color: 'var(--color-text-secondary)' }}>
          {childName} did it! 🎉
        </p>

        {/* Optional photo */}
        {content.photo_storage_path && (
          <div className="mt-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storageUrl(content.photo_storage_path)}
              alt="Milestone photo"
              className="w-40 h-40 object-cover rounded-2xl shadow-lg rotate-1"
            />
          </div>
        )}

        {/* Notes */}
        {content.notes && (
          <p className="mt-4 text-sm italic max-w-sm mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            &ldquo;{content.notes}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
