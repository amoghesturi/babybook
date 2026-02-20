-- ─── Storage buckets ───────────────────────────────────────────────────────
-- Create the media bucket for photos, audio, and video
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,  -- Not publicly accessible by default; use signed URLs
  52428800,  -- 50 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/mp4', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- ─── Storage RLS policies ──────────────────────────────────────────────────
-- Allow authenticated users to upload to their family's folder
create policy "media: owners can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and get_user_role() = 'owner'
    and (storage.foldername(name))[1] = get_user_family_id()::text
  );

-- Allow family members to view media
create policy "media: members can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = get_user_family_id()::text
  );

-- Allow owners to delete media
create policy "media: owners can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and get_user_role() = 'owner'
    and (storage.foldername(name))[1] = get_user_family_id()::text
  );
