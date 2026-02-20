import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Stub Next.js navigation so components that call useRouter/redirect don't blow up
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}));

// Stub Next.js cache so server actions that call revalidatePath don't blow up
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// Set env vars expected by app code
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
