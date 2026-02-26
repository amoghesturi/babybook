/**
 * Middleware auth guard tests.
 * We test the logic by calling the middleware function directly with mocked
 * NextRequest objects and a mocked Supabase client.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// ── Mock @supabase/ssr before importing middleware ──────────────────────────
const { mockGetUser } = vi.hoisted(() => ({ mockGetUser: vi.fn() }));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
  }),
}));

// ── Import after mocks ──────────────────────────────────────────────────────
import { middleware } from '@/middleware';

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`);
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('unauthenticated user', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({ data: { user: null } });
    });

    it('redirects to /login for protected routes', async () => {
      const res = await middleware(makeRequest('/book'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('redirects to /login for /settings', async () => {
      const res = await middleware(makeRequest('/settings'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/login');
    });

    it('allows access to /login', async () => {
      const res = await middleware(makeRequest('/login'));
      expect(res.status).not.toBe(307);
    });

    it('allows access to /signup', async () => {
      const res = await middleware(makeRequest('/signup'));
      expect(res.status).not.toBe(307);
    });

    it('allows access to /invite/some-token', async () => {
      const res = await middleware(makeRequest('/invite/abc-token-123'));
      expect(res.status).not.toBe(307);
    });

    it('allows access to /forgot-password', async () => {
      const res = await middleware(makeRequest('/forgot-password'));
      expect(res.status).not.toBe(307);
    });

    it('allows access to /reset-password', async () => {
      const res = await middleware(makeRequest('/reset-password'));
      expect(res.status).not.toBe(307);
    });
  });

  describe('authenticated but unconfirmed user', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email_confirmed_at: null } },
      });
    });

    it('redirects to /confirm-email for protected routes', async () => {
      const res = await middleware(makeRequest('/book'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/confirm-email');
    });

    it('allows access to /confirm-email itself (no redirect loop)', async () => {
      const res = await middleware(makeRequest('/confirm-email'));
      // No redirect means no Location header (status is 200, not 307)
      expect(res.status).not.toBe(307);
    });
  });

  describe('authenticated and confirmed user', () => {
    beforeEach(() => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-123', email_confirmed_at: '2024-01-01T00:00:00Z' } },
      });
    });

    it('allows access to /book', async () => {
      const res = await middleware(makeRequest('/book'));
      expect(res.status).not.toBe(307);
    });

    it('redirects away from /login to /', async () => {
      const res = await middleware(makeRequest('/login'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toMatch(/\/$/);
    });

    it('redirects away from /signup to /', async () => {
      const res = await middleware(makeRequest('/signup'));
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toMatch(/\/$/);
    });
  });
});
