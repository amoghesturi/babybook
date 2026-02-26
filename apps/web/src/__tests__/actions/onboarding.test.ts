/**
 * onboarding server action tests — Supabase fully mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123', email: 'test@example.com' } } }),
    },
    from: mockFrom,
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  },
}));

type AnyFn = ReturnType<typeof vi.fn>;

function makeChain(resolve: unknown) {
  const self = {
    select: vi.fn() as AnyFn,
    insert: vi.fn() as AnyFn,
    update: vi.fn() as AnyFn,
    eq: vi.fn() as AnyFn,
    single: vi.fn() as AnyFn,
    then: undefined as undefined,
  };
  self.select.mockReturnValue(self);
  self.insert.mockReturnValue(self);
  self.update.mockReturnValue(self);
  self.eq.mockReturnValue(self);
  self.single.mockResolvedValue(resolve);
  (self as Record<string, unknown>).then = (fn: (v: unknown) => void) =>
    Promise.resolve(resolve).then(fn);
  return self;
}

import { completeOnboarding } from '@/app/actions/onboarding';
import { createClient } from '@/lib/supabase/server';

const validData = {
  familyName: 'The Smiths',
  childName: 'Lily',
  dateOfBirth: '2024-03-15',
  gender: 'female' as const,
  bookTitle: "Lily's Baby Book",
  subtitle: 'The story of Lily',
  themeId: 'meadow',
};

describe('completeOnboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no existing family member (not yet onboarded)
    mockFrom.mockImplementation((table: string) => {
      if (table === 'family_members')
        return makeChain({ data: null, error: null });
      if (table === 'families')
        return makeChain({ data: { id: 'family-abc' }, error: null });
      if (table === 'children')
        return makeChain({ data: { id: 'child-xyz' }, error: null });
      if (table === 'book_pages')
        return makeChain({ data: { id: 'page-001' }, error: null });
      return makeChain({ data: null, error: null });
    });
  });

  it('throws when user is not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(completeOnboarding(validData)).rejects.toThrow('Not authenticated');
  });

  it('throws when family name is empty', async () => {
    await expect(completeOnboarding({ ...validData, familyName: '' }))
      .rejects.toThrow();
  });

  it('throws when dateOfBirth is not a valid date format', async () => {
    await expect(completeOnboarding({ ...validData, dateOfBirth: '15/03/2024' }))
      .rejects.toThrow();
  });

  it('throws when child name is empty', async () => {
    await expect(completeOnboarding({ ...validData, childName: '' }))
      .rejects.toThrow();
  });

  it('throws when DB family insert fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'family_members')
        return makeChain({ data: null, error: null });
      if (table === 'families')
        return makeChain({ data: null, error: { message: 'insert failed' } });
      return makeChain({ data: null, error: null });
    });
    await expect(completeOnboarding(validData)).rejects.toThrow('insert failed');
  });
});
