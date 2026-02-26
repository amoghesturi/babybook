import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// During `next build`, Next.js statically analyses every route (including
// /_not-found) by evaluating their full module graph. If this module throws
// at that point — before any request is handled — the build fails.
// We defer the throw to request time by skipping it during the build phase.
if (!parsed.success && process.env.NEXT_PHASE !== 'phase-production-build') {
  const missing = parsed.error.errors.map((e) => `  • ${e.path.join('.')}: ${e.message}`).join('\n');
  throw new Error(`Missing or invalid environment variables:\n${missing}`);
}

export const env = (parsed.data ?? {}) as z.infer<typeof envSchema>;
