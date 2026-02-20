/**
 * Convert a Supabase Storage relative path to a full public URL.
 * If the value already looks like a URL (starts with http), returns it as-is
 * so old saved data still works.
 */
export function storageUrl(path: string | undefined | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
