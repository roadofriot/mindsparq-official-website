-- ============================================================================
-- Migration: 20261016000005_content_versions_and_preview_tokens.sql
-- Description: Creates content_versions table for draft snapshots, revision
--              history, single-click restoration, and secure draft previews.
-- ============================================================================

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_type text not null, -- 'blog_post', 'course', 'program', 'site_section'
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

-- Index for speedy queries by content type and ID
create index if not exists idx_content_versions_lookup 
  on public.content_versions(content_type, content_id, version_number desc);

-- Enable RLS
alter table public.content_versions enable row level security;

-- Policies: Staff members can view and create revisions
create policy "Staff members can view content versions"
  on public.content_versions for select
  using (public.is_staff(auth.uid()));

create policy "Staff members can create content versions"
  on public.content_versions for insert
  with check (public.is_staff(auth.uid()));

-- Super Admins and Owners can delete versions if needed for compliance
create policy "Super Admins can delete content versions"
  on public.content_versions for delete
  using (public.is_admin_or_owner(auth.uid()));
