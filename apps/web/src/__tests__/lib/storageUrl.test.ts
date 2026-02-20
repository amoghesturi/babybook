import { describe, it, expect, beforeEach } from 'vitest';

// storageUrl reads NEXT_PUBLIC_SUPABASE_URL at module load time via process.env.
// The env var is set in setup.ts before any imports, so it's available.
import { storageUrl } from '@/lib/storageUrl';

const BASE = 'http://localhost:54321';

describe('storageUrl', () => {
  it('returns undefined for undefined input', () => {
    expect(storageUrl(undefined)).toBeUndefined();
  });

  it('returns undefined for null input', () => {
    expect(storageUrl(null)).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(storageUrl('')).toBeUndefined();
  });

  it('returns the same URL if input already starts with http', () => {
    const full = 'https://example.com/storage/v1/object/public/media/family/a.jpg';
    expect(storageUrl(full)).toBe(full);
  });

  it('constructs a full public URL from a relative storage path', () => {
    const path = 'family-uuid/1700000000000-abc.jpg';
    const expected = `${BASE}/storage/v1/object/public/media/${path}`;
    expect(storageUrl(path)).toBe(expected);
  });

  it('handles nested sub-paths correctly', () => {
    const path = 'fam-id/subfolder/image.png';
    expect(storageUrl(path)).toBe(`${BASE}/storage/v1/object/public/media/${path}`);
  });
});
