-- MindSparQ Education & Technology Database Schema
-- Migration 04: Super Admin Hardening & Multi-Author Blog Granular Security

-- 1. Extend user_roles constraint to support super_admin
alter table public.user_roles drop constraint if exists user_roles_role_key_check;
alter table public.user_roles add constraint user_roles_role_key_check 
  check (role_key in ('super_admin', 'owner', 'admin', 'editor', 'contributor', 'learner'));

-- 2. Extend profiles table with status & soft-deactivation tracking
alter table public.profiles add column if not exists status text not null default 'active' 
  check (status in ('active', 'invited', 'suspended', 'deactivated'));

-- 3. Extend blog_posts with audit tracking & SEO metadata
alter table public.blog_posts add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.blog_posts add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.blog_posts add column if not exists seo_title text null check (char_length(seo_title) <= 200);
alter table public.blog_posts add column if not exists seo_description text null check (char_length(seo_description) <= 350);

-- 4. Helper authorization functions
create or replace function public.is_super_admin_or_owner(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = user_uuid
      and role_key in ('super_admin', 'owner')
  );
$$;

create or replace function public.is_admin_or_owner(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = user_uuid
      and role_key in ('super_admin', 'owner', 'admin')
  );
$$;

create or replace function public.is_staff(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = user_uuid
      and role_key in ('super_admin', 'owner', 'admin', 'editor', 'contributor')
  );
$$;

-- 5. Hardened Role Management RLS Policies
-- Super Admin / Owner has unrestricted role management
drop policy if exists "Only owners and admins can manage roles" on public.user_roles;
drop policy if exists "Only owners and admins can update roles" on public.user_roles;
drop policy if exists "Only owners and admins can delete roles" on public.user_roles;
drop policy if exists "Super Admins can manage all roles" on public.user_roles;
drop policy if exists "Admins can manage non-privileged roles" on public.user_roles;
drop policy if exists "Admins can delete non-privileged roles" on public.user_roles;
drop policy if exists "Admins can assign non-privileged staff roles" on public.user_roles;
drop policy if exists "Admins can revoke non-privileged staff roles" on public.user_roles;

create policy "Super Admins can manage all roles"
  on public.user_roles for all
  using (public.is_super_admin_or_owner(auth.uid()))
  with check (public.is_super_admin_or_owner(auth.uid()));

create policy "Admins can assign non-privileged staff roles"
  on public.user_roles for insert
  with check (
    public.is_admin_or_owner(auth.uid()) 
    and role_key in ('editor', 'contributor', 'learner')
  );

create policy "Admins can revoke non-privileged staff roles"
  on public.user_roles for delete
  using (
    public.is_admin_or_owner(auth.uid())
    and role_key in ('editor', 'contributor', 'learner')
  );

-- 6. Granular Multi-Author Blog RLS Policies
drop policy if exists "Staff can manage blog posts" on public.blog_posts;
drop policy if exists "Staff can insert blog drafts" on public.blog_posts;
drop policy if exists "Authors and editors can update blog posts" on public.blog_posts;
drop policy if exists "Admins and Super Admins can delete blog posts" on public.blog_posts;

-- Insertion: Staff can insert posts. Non-admins cannot insert as published directly
create policy "Staff can insert blog drafts"
  on public.blog_posts for insert
  with check (
    public.is_staff(auth.uid())
    and (
      public.is_admin_or_owner(auth.uid())
      or status in ('draft', 'review')
    )
  );

-- Updates:
-- 1. Authors can edit their own drafts/reviews
-- 2. Editors can edit any draft or in-review post
-- 3. Admins / Super Admins can edit any post and publish/archive
create policy "Authors and editors can update blog posts"
  on public.blog_posts for update
  using (
    public.is_admin_or_owner(auth.uid())
    or (
      public.is_staff(auth.uid())
      and (
        author_id = auth.uid()
        or created_by = auth.uid()
        or exists (select 1 from public.user_roles where user_id = auth.uid() and role_key = 'editor')
      )
    )
  )
  with check (
    public.is_admin_or_owner(auth.uid())
    or (
      status in ('draft', 'review')
      and (author_id = auth.uid() or created_by = auth.uid() or exists (select 1 from public.user_roles where user_id = auth.uid() and role_key = 'editor'))
    )
  );

-- Deletion: Restricted strictly to Admins and Super Admins
create policy "Admins and Super Admins can delete blog posts"
  on public.blog_posts for delete
  using (public.is_admin_or_owner(auth.uid()));
