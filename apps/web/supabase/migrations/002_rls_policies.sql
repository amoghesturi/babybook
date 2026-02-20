-- ─── Enable RLS on all tables ───────────────────────────────────────────────
alter table families        enable row level security;
alter table children        enable row level security;
alter table family_members  enable row level security;
alter table book_pages      enable row level security;
alter table media           enable row level security;

-- ─── Helper function: get current user's family_id ─────────────────────────
create or replace function get_user_family_id()
returns uuid
language sql security definer stable
as $$
  select family_id
  from family_members
  where user_id = auth.uid()
    and invite_status = 'accepted'
  limit 1;
$$;

-- ─── Helper function: get current user's role ──────────────────────────────
create or replace function get_user_role()
returns text
language sql security definer stable
as $$
  select role
  from family_members
  where user_id = auth.uid()
    and invite_status = 'accepted'
  limit 1;
$$;

-- ─── families policies ─────────────────────────────────────────────────────
create policy "families: members can view their family"
  on families for select
  using (id = get_user_family_id());

create policy "families: owners can update"
  on families for update
  using (id = get_user_family_id() and get_user_role() = 'owner');

-- ─── children policies ─────────────────────────────────────────────────────
create policy "children: members can view"
  on children for select
  using (family_id = get_user_family_id());

create policy "children: owners can insert"
  on children for insert
  with check (family_id = get_user_family_id() and get_user_role() = 'owner');

create policy "children: owners can update"
  on children for update
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

-- ─── family_members policies ───────────────────────────────────────────────
-- Users can see members of their own family
create policy "family_members: members can view"
  on family_members for select
  using (
    family_id = get_user_family_id()
    or invite_token is not null  -- Allow lookup by token for invite flow
  );

-- Owners can insert new members (invites)
create policy "family_members: owners can insert"
  on family_members for insert
  with check (family_id = get_user_family_id() and get_user_role() = 'owner');

-- Owners can update member records
create policy "family_members: owners can update"
  on family_members for update
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

-- Self-update for invite acceptance (any authenticated user can accept their invite)
create policy "family_members: self update for invite"
  on family_members for update
  using (user_id = auth.uid() or invite_token is not null);

-- Owners can delete members
create policy "family_members: owners can delete"
  on family_members for delete
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

-- ─── book_pages policies ───────────────────────────────────────────────────
-- Viewers can only see published pages
create policy "book_pages: viewers see published"
  on book_pages for select
  using (
    family_id = get_user_family_id()
    and deleted_at is null
    and (
      status = 'published'
      or get_user_role() = 'owner'
    )
  );

-- Extra: hide letter content if reveal_date is in the future (for viewers)
-- This is handled at the application layer; DB-level via a view or function
-- The policy above ensures viewers see the row; content masking is app-layer

-- Owners can insert pages
create policy "book_pages: owners can insert"
  on book_pages for insert
  with check (family_id = get_user_family_id() and get_user_role() = 'owner');

-- Owners can update pages
create policy "book_pages: owners can update"
  on book_pages for update
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

-- Owners can delete (soft delete via updated_at)
create policy "book_pages: owners can delete"
  on book_pages for delete
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

-- ─── media policies ────────────────────────────────────────────────────────
create policy "media: members can view"
  on media for select
  using (family_id = get_user_family_id());

create policy "media: owners can insert"
  on media for insert
  with check (family_id = get_user_family_id() and get_user_role() = 'owner');

create policy "media: owners can delete"
  on media for delete
  using (family_id = get_user_family_id() and get_user_role() = 'owner');
