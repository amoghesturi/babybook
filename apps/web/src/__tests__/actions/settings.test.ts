/**
 * settings server action tests — Supabase fully mocked.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    from: mockFrom,
  }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({ from: mockFrom }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

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
    is: vi.fn() as AnyFn,
    single: vi.fn() as AnyFn,
    then: undefined as undefined,
  };
  self.select.mockReturnValue(self);
  self.insert.mockReturnValue(self);
  self.update.mockReturnValue(self);
  self.eq.mockReturnValue(self);
  self.is.mockReturnValue(self);
  self.single.mockResolvedValue(resolve);
  (self as Record<string, unknown>).then = (fn: (v: unknown) => void) =>
    Promise.resolve(resolve).then(fn);
  return self;
}

function setupOwnerContext() {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'family_members')
      return makeChain({ data: { family_id: 'family-abc', role: 'owner' }, error: null });
    if (table === 'children')
      return makeChain({ data: { id: 'child-xyz' }, error: null });
    return makeChain({ data: null, error: null });
  });
}

import { updateFamilyName, updateChildDetails, updateCoverPage } from '@/app/actions/settings';
import { createClient } from '@/lib/supabase/server';

describe('updateFamilyName', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(updateFamilyName('The Smiths')).rejects.toThrow('Not authenticated');
  });

  it('throws when name is empty', async () => {
    await expect(updateFamilyName('')).rejects.toThrow();
  });

  it('throws when name exceeds max length', async () => {
    await expect(updateFamilyName('a'.repeat(201))).rejects.toThrow();
  });

  it('resolves when update succeeds', async () => {
    await expect(updateFamilyName('The Johnsons')).resolves.not.toThrow();
  });

  it('throws when DB update fails', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'family_members')
        return makeChain({ data: { family_id: 'family-abc', role: 'owner' }, error: null });
      if (table === 'children')
        return makeChain({ data: { id: 'child-xyz' }, error: null });
      return makeChain({ data: null, error: { message: 'update failed' } });
    });
    await expect(updateFamilyName('The Smiths')).rejects.toThrow('update failed');
  });
});

describe('updateChildDetails', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  const validDetails = { name: 'Lily', dateOfBirth: '2024-03-15', gender: 'female' as const };

  it('throws when not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(updateChildDetails(validDetails)).rejects.toThrow('Not authenticated');
  });

  it('throws when child name is empty', async () => {
    await expect(updateChildDetails({ ...validDetails, name: '' })).rejects.toThrow();
  });

  it('throws when dateOfBirth format is invalid', async () => {
    await expect(updateChildDetails({ ...validDetails, dateOfBirth: '15-03-2024' })).rejects.toThrow();
  });

  it('resolves when update succeeds', async () => {
    await expect(updateChildDetails(validDetails)).resolves.not.toThrow();
  });
});

describe('updateCoverPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(updateCoverPage({ bookTitle: 'My Book', subtitle: '' }))
      .rejects.toThrow('Not authenticated');
  });

  it('throws when cover page not found', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'family_members')
        return makeChain({ data: { family_id: 'family-abc', role: 'owner' }, error: null });
      if (table === 'children')
        return makeChain({ data: { id: 'child-xyz' }, error: null });
      if (table === 'book_pages')
        return makeChain({ data: null, error: null });
      return makeChain({ data: null, error: null });
    });
    await expect(updateCoverPage({ bookTitle: 'My Book', subtitle: '' }))
      .rejects.toThrow('Cover page not found');
  });
});
