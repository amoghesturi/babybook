-- Drop all existing write policies and replace them with ones that work
-- correctly in Next.js server action context (where auth.uid() is reliable
-- but security-definer helper functions may not resolve correctly).

-- ── families ──────────────────────────────────────────────────────────────

drop policy if exists "families: owners can update" on families;

create policy "families: owners can update"
  on families for update
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = families.id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = families.id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

-- Allow any authenticated user to create a new family (needed for onboarding)
drop policy if exists "families: authenticated users can create" on families;

create policy "families: authenticated users can create"
  on families for insert
  to authenticated
  with check (true);

-- ── children ──────────────────────────────────────────────────────────────

drop policy if exists "children: owners can insert" on children;
drop policy if exists "children: owners can update" on children;

create policy "children: owners can insert"
  on children for insert
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = children.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

create policy "children: owners can update"
  on children for update
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = children.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = children.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

-- ── family_members ────────────────────────────────────────────────────────

drop policy if exists "family_members: owners can insert" on family_members;
drop policy if exists "family_members: owners can update" on family_members;
drop policy if exists "family_members: self update for invite" on family_members;

-- Any authenticated user can insert themselves as owner into a new family
-- (onboarding), or an existing owner can add viewers.
create policy "family_members: insert"
  on family_members for insert
  to authenticated
  with check (
    -- inserting yourself as owner of a brand-new family (no prior members)
    (
      user_id = auth.uid()
      and role = 'owner'
      and not exists (
        select 1 from family_members existing
        where existing.family_id = family_members.family_id
      )
    )
    or
    -- existing owner adding a viewer
    exists (
      select 1 from family_members existing
      where existing.family_id = family_members.family_id
        and existing.user_id   = auth.uid()
        and existing.role      = 'owner'
        and existing.invite_status = 'accepted'
    )
  );

-- Owners can update other members' records
create policy "family_members: owners can update"
  on family_members for update
  using (
    exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id   = auth.uid()
        and fm.role      = 'owner'
        and fm.invite_status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from family_members fm
      where fm.family_id = family_members.family_id
        and fm.user_id   = auth.uid()
        and fm.role      = 'owner'
        and fm.invite_status = 'accepted'
    )
  );

-- Viewers can update their own record (accept invite)
create policy "family_members: self update for invite"
  on family_members for update
  using  (user_id = auth.uid() or invite_token is not null)
  with check (user_id = auth.uid() or invite_token is not null);

-- ── book_pages ────────────────────────────────────────────────────────────

drop policy if exists "book_pages: owners can insert" on book_pages;
drop policy if exists "book_pages: owners can update" on book_pages;
drop policy if exists "book_pages: owners can delete" on book_pages;

create policy "book_pages: owners can insert"
  on book_pages for insert
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = book_pages.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

create policy "book_pages: owners can update"
  on book_pages for update
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = book_pages.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  )
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = book_pages.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

create policy "book_pages: owners can delete"
  on book_pages for delete
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = book_pages.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

-- ── media ─────────────────────────────────────────────────────────────────

drop policy if exists "media: owners can insert" on media;
drop policy if exists "media: owners can delete" on media;

create policy "media: owners can insert"
  on media for insert
  with check (
    exists (
      select 1 from family_members
      where family_members.family_id = media.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );

create policy "media: owners can delete"
  on media for delete
  using (
    exists (
      select 1 from family_members
      where family_members.family_id = media.family_id
        and family_members.user_id   = auth.uid()
        and family_members.role      = 'owner'
        and family_members.invite_status = 'accepted'
    )
  );
