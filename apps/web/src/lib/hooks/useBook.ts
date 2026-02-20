'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useBook(initialPageId: string) {
  const [currentPageId, setCurrentPageId] = useState(initialPageId);
  const router = useRouter();

  const navigateTo = useCallback(
    (pageId: string) => {
      setCurrentPageId(pageId);
      router.push(`/book/${pageId}`);
      // Persist last-read page
      if (typeof window !== 'undefined') {
        localStorage.setItem('babybook:last-page', pageId);
      }
    },
    [router]
  );

  return { currentPageId, navigateTo };
}
