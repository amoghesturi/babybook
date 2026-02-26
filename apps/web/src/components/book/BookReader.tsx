'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookNav } from './BookNav';
import { PageFlip } from './PageFlip';
import { PageRenderer } from './PageRenderer';
import { AddPageModal } from '@/components/editors/AddPageModal';
import { ChangeTemplateModal } from './ChangeTemplateModal';
import { LogoutButton } from '@/components/ui/LogoutButton';
import type { BookPage, NavigationInfo } from '@babybook/shared';

interface Props {
  page: BookPage;
  nav: NavigationInfo;
  isOwner: boolean;
  childName: string;
  childDob: string;
  sectionName?: string | null;
}

export function BookReader({ page, nav, isOwner, childName, childDob, sectionName }: Props) {
  const router = useRouter();
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeTemplate, setShowChangeTemplate] = useState(false);

  const goToPage = useCallback(
    (pageId: string, dir: 'next' | 'prev') => {
      setDirection(dir);
      router.push(`/book/${pageId}`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('babybook:last-page', pageId);
      }
    },
    [router]
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' && nav.prevPageId) {
        goToPage(nav.prevPageId, 'prev');
      } else if (e.key === 'ArrowRight' && nav.nextPageId) {
        goToPage(nav.nextPageId, 'next');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nav, goToPage]);

  // Touch/swipe support
  useEffect(() => {
    let startX = 0;
    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
    }
    function handleTouchEnd(e: TouchEvent) {
      const deltaX = e.changedTouches[0].clientX - startX;
      if (Math.abs(deltaX) < 50) return;
      if (deltaX < 0 && nav.nextPageId) {
        goToPage(nav.nextPageId, 'next');
      } else if (deltaX > 0 && nav.prevPageId) {
        goToPage(nav.prevPageId, 'prev');
      }
    }
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nav, goToPage]);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col min-w-0">
          <span className="font-display text-lg font-semibold text-primary truncate leading-tight">
            {childName ? `${childName}'s Baby Book` : 'Baby Book'}
          </span>
          {sectionName && (
            <span className="text-xs truncate leading-tight" style={{ color: 'var(--color-text-secondary)' }}>
              {sectionName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {page.status === 'draft' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
              Draft
            </span>
          )}
          {isOwner && (
            <button
              onClick={() => setShowChangeTemplate(true)}
              className="p-2 rounded-lg hover:bg-border/40 text-text-secondary hover:text-text-primary transition text-sm"
              title="Change Design"
            >
              🎨
            </button>
          )}
          {isOwner && (
            <a
              href="/book/manage"
              className="p-2 rounded-lg hover:bg-border/40 text-text-secondary hover:text-text-primary transition text-sm"
              title="Manage Book"
            >
              📋
            </a>
          )}
          {isOwner && (
            <a
              href="/settings"
              className="p-2 rounded-lg hover:bg-border/40 text-text-secondary hover:text-text-primary transition text-sm"
              title="Settings"
            >
              ⚙️
            </a>
          )}
          <LogoutButton />
        </div>
      </header>

      {/* Book area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4">
        <div className="w-full max-w-2xl relative">
          {/* Prev arrow */}
          <button
            onClick={() => nav.prevPageId && goToPage(nav.prevPageId, 'prev')}
            disabled={!nav.prevPageId}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 rounded-full bg-surface shadow-md flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition"
            aria-label="Previous page"
          >
            ◀
          </button>

          {/* Page */}
          <PageFlip pageId={page.id} direction={direction}>
            <div className="book-page min-h-[500px] md:min-h-[600px] w-full">
              <PageRenderer
                page={page}
                childName={childName}
                childDob={childDob}
                isOwner={isOwner}
              />
            </div>
          </PageFlip>

          {/* Next arrow */}
          <button
            onClick={() => nav.nextPageId && goToPage(nav.nextPageId, 'next')}
            disabled={!nav.nextPageId}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 rounded-full bg-surface shadow-md flex items-center justify-center text-text-secondary hover:text-primary hover:shadow-lg disabled:opacity-20 disabled:cursor-not-allowed transition"
            aria-label="Next page"
          >
            ▶
          </button>
        </div>

        {/* Page counter + controls */}
        <BookNav
          nav={nav}
          isOwner={isOwner}
          onAddPage={() => setShowAddModal(true)}
          pageId={page.id}
        />
      </main>

      {/* Add page modal */}
      {showAddModal && (
        <AddPageModal
          pageId={page.id}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Change template modal */}
      {showChangeTemplate && (
        <ChangeTemplateModal
          pageId={page.id}
          pageType={page.page_type}
          currentVariant={page.template_variant ?? 'classic'}
          onClose={() => setShowChangeTemplate(false)}
        />
      )}
    </div>
  );
}
