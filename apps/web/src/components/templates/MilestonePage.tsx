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
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 50% 40%, var(--color-primary-light) 0%, transparent 70%),
          radial-gradient(ellipse 50% 40% at 20% 80%, var(--color-secondary-light) 0%, transparent 60%),
          var(--color-surface)
        `,
      }}
    >
      {/* Sunburst rays */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width="100%" height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.05 }}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={i}
              x1="50%" y1="50%"
              x2={`${50 + 70 * Math.cos(rad)}%`}
              y2={`${50 + 70 * Math.sin(rad)}%`}
              stroke="var(--color-primary)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>

      {/* Confetti burst */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const colors = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', '#fff'];
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: '-10px',
                  width: i % 3 === 0 ? '10px' : '7px',
                  height: i % 3 === 0 ? '10px' : '7px',
                  borderRadius: i % 2 === 0 ? '50%' : '2px',
                  background: colors[i % colors.length],
                  opacity: 0.85,
                  animation: `confettiFall ${1.2 + (i % 5) * 0.3}s ease-in forwards`,
                  animationDelay: `${(i % 8) * 0.07}s`,
                  transform: `rotate(${(i * 47) % 360}deg)`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Certificate outer border */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '12px',
          border: '2px solid var(--color-primary)',
          borderRadius: '8px',
          opacity: 0.25,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          inset: '18px',
          border: '1px solid var(--color-primary)',
          borderRadius: '6px',
          opacity: 0.15,
        }}
      />

      {/* Corner stars */}
      {['top-7 left-7', 'top-7 right-7', 'bottom-7 left-7', 'bottom-7 right-7'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} pointer-events-none`}
          style={{ color: 'var(--color-secondary)', fontSize: '18px', opacity: 0.45 }}
        >
          ★
        </div>
      ))}

      {/* Category badge */}
      <div
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{
          background: 'var(--color-primary)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {catInfo?.emoji} {catInfo?.label}
      </div>

      {/* Age badge */}
      {ageLabel && (
        <div
          className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'var(--color-secondary)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {ageLabel}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 px-8 py-10 flex flex-col items-center">
        {/* Medal ring */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-6"
          style={{
            background: 'linear-gradient(145deg, var(--color-primary-light), var(--color-secondary-light))',
            boxShadow: `
              0 0 0 4px var(--color-surface),
              0 0 0 7px var(--color-primary-light),
              0 8px 28px rgba(0,0,0,0.14)
            `,
          }}
        >
          {emoji}
        </div>

        {/* "Achievement Unlocked" label */}
        <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-3"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Achievement Unlocked
        </p>

        {/* Milestone name */}
        <h2
          className="font-display font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
            color: 'var(--color-primary-dark)',
            letterSpacing: '-0.01em',
          }}
        >
          {content.milestone_name}
        </h2>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 w-full max-w-xs">
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          <span style={{ color: 'var(--color-secondary)', fontSize: '16px' }}>🌟</span>
          <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Child name */}
        <p
          className="font-handwritten text-2xl"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {childName} did it! 🎉
        </p>

        {/* Optional photo (polaroid style) */}
        {content.photo_storage_path && (
          <div
            className="mt-6"
            style={{
              background: 'white',
              padding: '7px 7px 28px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
              transform: 'rotate(1.5deg)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storageUrl(content.photo_storage_path)}
              alt="Milestone photo"
              style={{ width: '130px', height: '130px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Notes */}
        {content.notes && (
          <div
            className="mt-5 max-w-xs px-4 py-3 rounded-xl text-sm italic"
            style={{
              background: 'var(--color-background)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            &ldquo;{content.notes}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
