-- ==============================================================================
-- Migration: 20261017000008_cms_core.sql
-- MindSparQ Education & Technology (mindsparqeducation.com.np)
--
-- Enterprise CMS document store with strict Draft / Published separation.
--
--   cms_documents  -> PUBLISHED content only. Readable by everyone (anon).
--   cms_drafts     -> DRAFT content. Readable/writable by staff only.
--
-- Every manually editable thing on the website is a JSON "document" keyed by a
-- stable string, e.g.:
--   settings.header, settings.footer, settings.design, settings.general,
--   settings.seo, settings.ads, settings.social, sections.home, page.about ...
--
-- Fully idempotent: safe to run multiple times.
-- ==============================================================================

-- 0. Role helpers (re-declared defensively; identical semantics to migration 04)
create or replace function public.is_admin_or_owner(user_uuid uuid)
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
  select exists (select 1 from public.user_roles
                 where user_id = user_uuid and role_key in ('super_admin', 'owner', 'admin'));
$$;

-- Extend role catalogue with Designer and SEO Manager
alter table public.user_roles drop constraint if exists user_roles_role_key_check;
alter table public.user_roles add constraint user_roles_role_key_check
  check (role_key in ('super_admin', 'owner', 'admin', 'editor', 'designer', 'seo_manager', 'contributor', 'learner'));

create or replace function public.is_staff(user_uuid uuid)
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
  select exists (select 1 from public.user_roles
                 where user_id = user_uuid
                   and role_key in ('super_admin', 'owner', 'admin', 'editor', 'designer', 'seo_manager', 'contributor'));
$$;

-- Who may push content live (contributors may only save drafts)
create or replace function public.can_publish_cms(user_uuid uuid)
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
  select exists (select 1 from public.user_roles
                 where user_id = user_uuid
                   and role_key in ('super_admin', 'owner', 'admin', 'editor', 'designer', 'seo_manager'));
$$;

-- 1. Published documents (public)
create table if not exists public.cms_documents (
  key text primary key check (key ~ '^[a-z0-9_.:-]{2,120}$'),
  data jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  published_at timestamptz not null default timezone('utc'::text, now()),
  published_by uuid references auth.users(id) on delete set null,
  published_by_name text null
);

-- 2. Draft documents (staff only)
create table if not exists public.cms_drafts (
  key text primary key check (key ~ '^[a-z0-9_.:-]{2,120}$'),
  data jsonb not null default '{}'::jsonb,
  base_version integer not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now()),
  updated_by uuid references auth.users(id) on delete set null,
  updated_by_name text null
);

alter table public.cms_documents enable row level security;
alter table public.cms_drafts enable row level security;

drop policy if exists "Anyone can read published CMS documents" on public.cms_documents;
create policy "Anyone can read published CMS documents"
  on public.cms_documents for select
  using (key not like 'secure.%' or public.is_admin_or_owner(auth.uid()));

drop policy if exists "Publishers can publish CMS documents" on public.cms_documents;
create policy "Publishers can publish CMS documents"
  on public.cms_documents for insert
  with check (public.can_publish_cms(auth.uid())
              and (key not like 'secure.%' or public.is_admin_or_owner(auth.uid())));

drop policy if exists "Publishers can update CMS documents" on public.cms_documents;
create policy "Publishers can update CMS documents"
  on public.cms_documents for update
  using (public.can_publish_cms(auth.uid()))
  with check (public.can_publish_cms(auth.uid())
              and (key not like 'secure.%' or public.is_admin_or_owner(auth.uid())));

drop policy if exists "Admins can delete CMS documents" on public.cms_documents;
create policy "Admins can delete CMS documents"
  on public.cms_documents for delete
  using (public.is_admin_or_owner(auth.uid()));

drop policy if exists "Staff can read CMS drafts" on public.cms_drafts;
create policy "Staff can read CMS drafts"
  on public.cms_drafts for select
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can write CMS drafts" on public.cms_drafts;
create policy "Staff can write CMS drafts"
  on public.cms_drafts for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid())
              and (key not like 'secure.%' or public.is_admin_or_owner(auth.uid())));

-- 3. Content versions (revision history) — from migration 05, made idempotent
create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  version_number int not null default 1,
  title text not null,
  snapshot jsonb not null default '{}'::jsonb,
  change_summary text,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text,
  created_at timestamptz not null default now(),
  restored_at timestamptz
);
create index if not exists idx_content_versions_lookup
  on public.content_versions(content_type, content_id, version_number desc);
alter table public.content_versions enable row level security;

drop policy if exists "Staff members can view content versions" on public.content_versions;
create policy "Staff members can view content versions"
  on public.content_versions for select using (public.is_staff(auth.uid()));
drop policy if exists "Staff members can create content versions" on public.content_versions;
create policy "Staff members can create content versions"
  on public.content_versions for insert with check (public.is_staff(auth.uid()));
drop policy if exists "Super Admins can delete content versions" on public.content_versions;
create policy "Super Admins can delete content versions"
  on public.content_versions for delete using (public.is_admin_or_owner(auth.uid()));

-- 4. Inquiry tracking columns (SEM attribution + workflow)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'inquiries') then
    alter table public.inquiries add column if not exists utm_source text null;
    alter table public.inquiries add column if not exists utm_medium text null;
    alter table public.inquiries add column if not exists utm_campaign text null;
    alter table public.inquiries add column if not exists landing_path text null;
    alter table public.inquiries add column if not exists handled_status text not null default 'new';
  end if;
end $$;

-- 5. Realtime: push publish events to every open browser instantly
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.cms_documents;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
