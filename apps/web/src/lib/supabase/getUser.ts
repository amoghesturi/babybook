import { cache } from 'react';
import { createClient } from './server';

/**
 * Returns the current authenticated user, deduped within a single render pass
 * via React.cache so middleware + page server components share one JWT verification.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  return supabase.auth.getUser();
});
