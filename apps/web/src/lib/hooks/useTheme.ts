'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ThemeId } from '@babybook/shared';

export function useTheme() {
  const supabase = createClient();

  const setTheme = useCallback(
    async (themeId: ThemeId, familyId: string) => {
      // Apply immediately in DOM (no flash)
      document.documentElement.dataset.theme = themeId;

      // Persist to DB
      await supabase
        .from('families')
        .update({ theme_id: themeId })
        .eq('id', familyId);
    },
    [supabase]
  );

  const applyTheme = useCallback((themeId: ThemeId) => {
    document.documentElement.dataset.theme = themeId;
  }, []);

  return { setTheme, applyTheme };
}
