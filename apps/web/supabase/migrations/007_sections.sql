-- ─── book_sections table ──────────────────────────────────────────────────────
create table book_sections (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families(id) on delete cascade,
  child_id     uuid not null references children(id)  on delete cascade,
  name         text not null,
  section_type text not null check (section_type in (
                  'pregnancy','birth','newborn_0_3',
                  'first_6_months','second_6_months','toddler','custom'
               )),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index book_sections_family_id_idx on book_sections(family_id);

-- ─── Add section_id to book_pages ─────────────────────────────────────────────
alter table book_pages
  add column if not exists section_id uuid references book_sections(id) on delete set null;

create index book_pages_section_id_idx on book_pages(section_id);

-- ─── RLS for book_sections ────────────────────────────────────────────────────
alter table book_sections enable row level security;

create policy "book_sections: members select"
  on book_sections for select
  using (family_id = get_user_family_id());

create policy "book_sections: owners insert"
  on book_sections for insert
  with check (family_id = get_user_family_id() and get_user_role() = 'owner');

create policy "book_sections: owners update"
  on book_sections for update
  using (family_id = get_user_family_id() and get_user_role() = 'owner');

create policy "book_sections: owners delete"
  on book_sections for delete
  using (family_id = get_user_family_id() and get_user_role() = 'owner');
