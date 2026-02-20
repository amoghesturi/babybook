-- Replace storage policies that used security-definer helpers with
-- inline EXISTS subqueries so auth.uid() is resolved directly.

drop policy if exists "media: owners can upload" on storage.objects;
drop policy if exists "media: members can read"  on storage.objects;
drop policy if exists "media: owners can delete" on storage.objects;

-- Upload: authenticated owner, path must start with their family_id
create policy "media: owners can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and exists (
      select 1 from public.family_members
      where family_members.user_id        = auth.uid()
        and family_members.role           = 'owner'
        and family_members.invite_status  = 'accepted'
        and family_members.family_id::text = (storage.foldername(name))[1]
    )
  );

-- Read: any family member (bucket is public so this is belt-and-suspenders)
create policy "media: members can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from public.family_members
      where family_members.user_id        = auth.uid()
        and family_members.invite_status  = 'accepted'
        and family_members.family_id::text = (storage.foldername(name))[1]
    )
  );

-- Delete: owner only
create policy "media: owners can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1 from public.family_members
      where family_members.user_id        = auth.uid()
        and family_members.role           = 'owner'
        and family_members.invite_status  = 'accepted'
        and family_members.family_id::text = (storage.foldername(name))[1]
    )
  );
