/**
 * sections server action tests — Supabase fully mocked.
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
    delete: vi.fn() as AnyFn,
    eq: vi.fn() as AnyFn,
    is: vi.fn() as AnyFn,
    order: vi.fn() as AnyFn,
    limit: vi.fn() as AnyFn,
    single: vi.fn() as AnyFn,
    then: undefined as undefined,
  };
  self.select.mockReturnValue(self);
  self.insert.mockReturnValue(self);
  self.update.mockReturnValue(self);
  self.delete.mockReturnValue(self);
  self.eq.mockReturnValue(self);
  self.is.mockReturnValue(self);
  self.order.mockReturnValue(self);
  self.limit.mockReturnValue(self);
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
      return makeChain({ data: { id: 'child-xyz', date_of_birth: '2024-01-01' }, error: null });
    if (table === 'book_sections')
      return makeChain({ data: { id: 'section-001', name: 'Birth', section_type: 'birth', family_id: 'family-abc', child_id: 'child-xyz', sort_order: 0, created_at: '' }, error: null, count: 0 });
    if (table === 'book_pages')
      return makeChain({ data: null, error: null });
    return makeChain({ data: null, error: null });
  });
}

import { createSection, deleteSection, movePageToSection, renameSection } from '@/app/actions/sections';
import { createClient } from '@/lib/supabase/server';

describe('createSection', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(createSection('birth')).rejects.toThrow('Not authenticated');
  });

  it('throws when section type is invalid', async () => {
    await expect(createSection('invalid-type' as never)).rejects.toThrow();
  });

  it('resolves with section data for a valid type', async () => {
    const result = await createSection('birth');
    expect(result).toHaveProperty('id');
  });
});

describe('deleteSection', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when sectionId is not a valid UUID', async () => {
    await expect(deleteSection('not-a-uuid')).rejects.toThrow();
  });

  it('resolves when delete succeeds', async () => {
    await expect(deleteSection('00000000-0000-0000-0000-000000000001')).resolves.not.toThrow();
  });
});

describe('renameSection', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when sectionId is not a valid UUID', async () => {
    await expect(renameSection('bad-id', 'New Name')).rejects.toThrow();
  });

  it('throws when name is empty', async () => {
    await expect(renameSection('00000000-0000-0000-0000-000000000001', '')).rejects.toThrow();
  });

  it('resolves with valid inputs', async () => {
    await expect(
      renameSection('00000000-0000-0000-0000-000000000001', 'Renamed Section')
    ).resolves.not.toThrow();
  });
});

describe('movePageToSection', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when pageId is not a valid UUID', async () => {
    await expect(movePageToSection('bad-id', null)).rejects.toThrow();
  });

  it('throws when sectionId is provided but not a valid UUID', async () => {
    await expect(
      movePageToSection('00000000-0000-0000-0000-000000000001', 'bad-section-id')
    ).rejects.toThrow();
  });

  it('resolves when moving to null (unsectioned)', async () => {
    await expect(
      movePageToSection('00000000-0000-0000-0000-000000000001', null)
    ).resolves.not.toThrow();
  });
});
