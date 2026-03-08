-- Add public sharing fields to families
alter table families
  add column share_token uuid not null default gen_random_uuid(),
  add column sharing_enabled boolean not null default false;

-- Unique index so token lookups are fast and guaranteed unique
create unique index families_share_token_idx on families(share_token);
