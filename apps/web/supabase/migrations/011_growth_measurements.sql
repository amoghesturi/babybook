create table growth_measurements (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  child_id    uuid not null references children(id) on delete cascade,
  measured_at date not null,
  weight_kg   numeric(5,3),
  height_cm   numeric(5,2),
  head_circumference_cm numeric(5,2),
  created_at  timestamptz default now(),
  constraint at_least_one_measurement check (
    weight_kg is not null or height_cm is not null or head_circumference_cm is not null
  )
);

-- RLS
alter table growth_measurements enable row level security;

create policy "family members can read"
  on growth_measurements for select
  using (family_id in (select family_id from family_members where user_id = auth.uid()));

create policy "owners can insert"
  on growth_measurements for insert
  with check (family_id in (select family_id from family_members where user_id = auth.uid() and role = 'owner'));

create policy "owners can update"
  on growth_measurements for update
  using (family_id in (select family_id from family_members where user_id = auth.uid() and role = 'owner'));

create policy "owners can delete"
  on growth_measurements for delete
  using (family_id in (select family_id from family_members where user_id = auth.uid() and role = 'owner'));
