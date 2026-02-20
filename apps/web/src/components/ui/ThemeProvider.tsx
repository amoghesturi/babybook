'use client';

import { useEffect } from 'react';
import type { ThemeId } from '@babybook/shared';

interface ThemeProviderProps {
  themeId: ThemeId;
  children: React.ReactNode;
}

export function ThemeProvider({ themeId, children }: ThemeProviderProps) {
  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  return <>{children}</>;
}
