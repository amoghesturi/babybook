'use client';

import Link from 'next/link';
import type { NavigationInfo } from '@babybook/shared';

interface Props {
  nav: NavigationInfo;
  isOwner: boolean;
  onAddPage: () => void;
  pageId: string;
}

export function BookNav({ nav, isOwner, onAddPage, pageId }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-2xl">
      {/* Page counter */}
      <span className="text-sm text-text-secondary">
        Page {nav.currentIndex + 1} of {nav.totalPages}
      </span>

      {/* Dot indicators (max 20 visible) */}
      <div className="flex gap-1.5 items-center">
        {nav.totalPages <= 20
          ? Array.from({ length: nav.totalPages }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === nav.currentIndex
                    ? 'w-4 h-2 bg-primary'
                    : 'w-2 h-2 bg-border'
                }`}
              />
            ))
          : (
            <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${((nav.currentIndex + 1) / nav.totalPages) * 100}%`,
                }}
              />
            </div>
          )}
      </div>

      {/* Owner controls */}
      {isOwner && (
        <div className="flex gap-3 mt-1">
          <button
            onClick={onAddPage}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition shadow-sm"
          >
            <span>+</span> Add Page
          </button>
          <Link
            href="/book/manage"
            className="flex items-center gap-1.5 px-4 py-2 border border-border text-text-secondary text-sm font-medium rounded-xl hover:bg-border/30 transition"
          >
            📋 Manage Book
          </Link>
        </div>
      )}
    </div>
  );
}
