/**
 * Server action tests — Supabase is fully mocked so these run without a real DB.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoist shared mock fn BEFORE vi.mock factories run ────────────────────────
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

// ─── Minimal chainable stub ────────────────────────────────────────────────────
type AnyFn = ReturnType<typeof vi.fn>;

function makeChain(resolve: unknown) {
  // Every method returns `self` for chaining, except the last awaited call.
  const self = {
    select: vi.fn() as AnyFn,
    insert: vi.fn() as AnyFn,
    update: vi.fn() as AnyFn,
    delete: vi.fn() as AnyFn,
    eq:     vi.fn() as AnyFn,
    is:     vi.fn() as AnyFn,
    single: vi.fn() as AnyFn,
    head:   vi.fn() as AnyFn,
    // Make the chain itself awaitable so `await supabase.from().insert()` works
    then: undefined as undefined,
  };

  // Chain: each method returns self
  self.select.mockReturnValue(self);
  self.insert.mockReturnValue(self);
  self.update.mockReturnValue(self);
  self.delete.mockReturnValue(self);
  self.eq.mockReturnValue(self);
  self.is.mockReturnValue(self);
  self.head.mockReturnValue(self);

  // Terminal: .single() and undecorated chain awaits resolve to `resolve`
  self.single.mockResolvedValue(resolve);
  // Make the chain itself a thenable so `await chain` works
  (self as Record<string, unknown>).then = (fn: (v: unknown) => void) => Promise.resolve(resolve).then(fn);

  return self;
}

// ─── Wire up getOwnerContext to succeed ───────────────────────────────────────
function setupOwnerContext(familyId = 'family-abc', childId = 'child-xyz') {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'family_members')
      return makeChain({ data: { family_id: familyId, role: 'owner' }, error: null });
    if (table === 'children')
      return makeChain({ data: { id: childId }, error: null });
    // book_pages and families get a generic success chain
    return makeChain({ data: null, error: null, count: 0 });
  });
}

// ─── Import AFTER mocks ───────────────────────────────────────────────────────
import { createPage, inviteMember, updateTheme } from '@/app/actions/pages';
import { createClient } from '@/lib/supabase/server';

// ─── createPage ───────────────────────────────────────────────────────────────
describe('createPage', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('throws when user is not authenticated', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
      from: mockFrom,
    });
    await expect(createPage('cover', '2024-01-01', { book_title: 'Test' }))
      .rejects.toThrow('Not authenticated');
  });

  it('throws when user is a viewer, not an owner', async () => {
    (createClient as AnyFn).mockResolvedValueOnce({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }) },
      from: (table: string) => {
        if (table === 'family_members')
          return makeChain({ data: { family_id: 'fam', role: 'viewer' }, error: null });
        return makeChain({ data: null, error: null });
      },
    });
    await expect(createPage('cover', '2024-01-01', { book_title: 'Test' }))
      .rejects.toThrow('Not authorized');
  });
});

// ─── inviteMember ─────────────────────────────────────────────────────────────
describe('inviteMember', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('returns an invite URL containing /invite/', async () => {
    const result = await inviteMember('grandma@example.com');
    expect(result.inviteUrl).toMatch(/\/invite\//);
  });

  it('invite URL starts with the APP_URL', async () => {
    const result = await inviteMember('grandma@example.com');
    expect(result.inviteUrl).toMatch(/^http:\/\/localhost:3000/);
  });

  it('throws when the DB insert returns an error', async () => {
    // inviteMember calls from() 3 times in order:
    //   1st: family_members (getOwnerContext select)
    //   2nd: children      (getOwnerContext select)
    //   3rd: family_members (the insert — this one should error)
    mockFrom
      .mockImplementationOnce(() => makeChain({ data: { family_id: 'family-abc', role: 'owner' }, error: null }))
      .mockImplementationOnce(() => makeChain({ data: { id: 'child-xyz' }, error: null }))
      .mockImplementationOnce(() => makeChain({ data: null, error: { message: 'unique violation' } }));

    await expect(inviteMember('existing@example.com')).rejects.toThrow('unique violation');
  });
});

// ─── updateTheme ──────────────────────────────────────────────────────────────
describe('updateTheme', () => {
  beforeEach(() => { vi.clearAllMocks(); setupOwnerContext(); });

  it('resolves without throwing when update succeeds', async () => {
    await expect(updateTheme('ocean')).resolves.not.toThrow();
  });

  it('throws when DB update returns an error', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'family_members')
        return makeChain({ data: { family_id: 'family-abc', role: 'owner' }, error: null });
      if (table === 'children')
        return makeChain({ data: { id: 'child-xyz' }, error: null });
      // families update returns an error
      return makeChain({ data: null, error: { message: 'update failed' } });
    });

    await expect(updateTheme('ocean')).rejects.toThrow('update failed');
  });
});
