-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── families ──────────────────────────────────────────────────────────────
create table families (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  theme_id   text not null default 'cotton-candy',
  created_at timestamptz not null default now()
);

-- ─── children ──────────────────────────────────────────────────────────────
create table children (
  id            uuid primary key default uuid_generate_v4(),
  family_id     uuid not null references families(id) on delete cascade,
  name          text not null,
  date_of_birth date not null,
  gender        text check (gender in ('male', 'female', 'other')),
  avatar_url    text,
  created_at    timestamptz not null default now()
);

create index children_family_id_idx on children(family_id);

-- ─── family_members ────────────────────────────────────────────────────────
create table family_members (
  id             uuid primary key default uuid_generate_v4(),
  family_id      uuid not null references families(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  email          text not null,
  role           text not null default 'viewer' check (role in ('owner', 'viewer')),
  invite_token   text unique,
  invite_status  text not null default 'pending' check (invite_status in ('pending', 'accepted')),
  created_at     timestamptz not null default now()
);

create index family_members_family_id_idx on family_members(family_id);
create index family_members_user_id_idx on family_members(user_id);
create index family_members_invite_token_idx on family_members(invite_token);

-- ─── book_pages ────────────────────────────────────────────────────────────
create table book_pages (
  id               uuid primary key default uuid_generate_v4(),
  family_id        uuid not null references families(id) on delete cascade,
  child_id         uuid not null references children(id) on delete cascade,
  page_type        text not null check (page_type in (
                     'cover', 'birth_story', 'milestone', 'photo_spread',
                     'journal', 'letter', 'monthly_summary'
                   )),
  template_variant text,
  page_date        timestamptz not null,
  sort_order       integer not null default 0,
  status           text not null default 'draft' check (status in ('draft', 'published')),
  content          jsonb not null default '{}',
  deleted_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index book_pages_family_id_idx on book_pages(family_id);
create index book_pages_child_id_idx on book_pages(child_id);
create index book_pages_page_date_idx on book_pages(page_date);
create index book_pages_status_idx on book_pages(status);

-- Auto-update updated_at
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger book_pages_updated_at
  before update on book_pages
  for each row execute function update_updated_at_column();

-- ─── media ─────────────────────────────────────────────────────────────────
create table media (
  id           uuid primary key default uuid_generate_v4(),
  family_id    uuid not null references families(id) on delete cascade,
  child_id     uuid not null references children(id) on delete cascade,
  storage_path text not null,
  public_url   text not null,
  media_type   text not null check (media_type in ('photo', 'audio', 'video')),
  file_size    bigint not null,
  taken_at     timestamptz,
  created_at   timestamptz not null default now()
);

create index media_family_id_idx on media(family_id);
create index media_child_id_idx on media(child_id);
