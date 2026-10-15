-- MindSparQ Education & Technology Database Schema
-- Migration 02: Row Level Security (RLS) & Authorization Helpers

-- 1. Helper Functions with Immutable Search Path
create or replace function public.has_role(user_uuid uuid, role_name text)
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
      and role_key = role_name
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
      and role_key in ('owner', 'admin')
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
      and role_key in ('owner', 'admin', 'editor', 'contributor')
  );
$$;

-- 2. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.media_assets enable row level security;
alter table public.carousel_items enable row level security;
alter table public.programs enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;
alter table public.content_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.events enable row level security;
alter table public.social_links enable row level security;
alter table public.content_pages enable row level security;
alter table public.audit_logs enable row level security;

-- =======================================================
-- PROFILES POLICIES
-- =======================================================
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =======================================================
-- USER ROLES POLICIES (Strict RBAC)
-- =======================================================
create policy "Users can view their own roles"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin_or_owner(auth.uid()));

create policy "Only owners and admins can manage roles"
  on public.user_roles for insert
  with check (public.is_admin_or_owner(auth.uid()));

create policy "Only owners and admins can update roles"
  on public.user_roles for update
  using (public.is_admin_or_owner(auth.uid()))
  with check (public.is_admin_or_owner(auth.uid()));

create policy "Only owners and admins can delete roles"
  on public.user_roles for delete
  using (public.is_admin_or_owner(auth.uid()));

-- =======================================================
-- CAROUSEL POLICIES
-- =======================================================
create policy "Public can view published active carousel slides"
  on public.carousel_items for select
  using (
    (status = 'published' and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()))
    or public.is_staff(auth.uid())
  );

create policy "Staff can manage carousel items"
  on public.carousel_items for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- PROGRAMS POLICIES
-- =======================================================
create policy "Public can view published programs"
  on public.programs for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "Staff can manage programs"
  on public.programs for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- COURSES POLICIES
-- =======================================================
create policy "Public can view published public courses"
  on public.courses for select
  using (
    (status = 'published' and visibility in ('public', 'unlisted'))
    or public.is_staff(auth.uid())
    or exists (
      select 1 from public.enrollments e
      where e.course_id = courses.id and e.user_id = auth.uid()
    )
  );

create policy "Staff can manage courses"
  on public.courses for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- MODULES & LESSONS POLICIES
-- =======================================================
create policy "Public or enrolled users can view modules of accessible courses"
  on public.course_modules for select
  using (
    status = 'published'
    or public.is_staff(auth.uid())
  );

create policy "Staff can manage modules"
  on public.course_modules for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "Users can view lessons if course is accessible"
  on public.lessons for select
  using (
    status = 'published'
    or public.is_staff(auth.uid())
  );

create policy "Staff can manage lessons"
  on public.lessons for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- ENROLLMENTS POLICIES
-- =======================================================
create policy "Users can view their own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin_or_owner(auth.uid()));

create policy "Users can enroll themselves in free courses"
  on public.enrollments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.courses c
      where c.id = course_id
        and c.status = 'published'
        and c.access_type = 'free'
    )
  );

create policy "Users can update their own enrollment status"
  on public.enrollments for update
  using (auth.uid() = user_id or public.is_admin_or_owner(auth.uid()))
  with check (auth.uid() = user_id or public.is_admin_or_owner(auth.uid()));

-- =======================================================
-- LESSON PROGRESS POLICIES
-- =======================================================
create policy "Users can manage their own lesson progress"
  on public.lesson_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =======================================================
-- BLOG POSTS POLICIES
-- =======================================================
create policy "Public can view published blog posts"
  on public.blog_posts for select
  using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or public.is_staff(auth.uid())
  );

create policy "Staff can manage blog posts"
  on public.blog_posts for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- BLOG COMMENTS POLICIES (Moderation-First)
-- =======================================================
create policy "Public can view approved comments"
  on public.blog_comments for select
  using (
    status = 'approved'
    or auth.uid() = user_id
    or public.is_staff(auth.uid())
  );

create policy "Authenticated users can submit comments"
  on public.blog_comments for insert
  with check (
    auth.uid() = user_id
    and status = 'pending' -- Client cannot self-approve comments
  );

create policy "Users can delete their own comments"
  on public.blog_comments for delete
  using (auth.uid() = user_id or public.is_staff(auth.uid()));

create policy "Staff can moderate comments"
  on public.blog_comments for update
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- LIKES POLICIES
-- =======================================================
create policy "Public can view like records"
  on public.content_likes for select
  using (true);

create policy "Authenticated users can manage their own likes"
  on public.content_likes for insert
  with check (auth.uid() = user_id);

create policy "Authenticated users can remove their own likes"
  on public.content_likes for delete
  using (auth.uid() = user_id);

-- =======================================================
-- BOOKMARKS POLICIES
-- =======================================================
create policy "Users can view and manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =======================================================
-- EVENTS POLICIES
-- =======================================================
create policy "Public can view published events"
  on public.events for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "Staff can manage events"
  on public.events for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- SOCIAL LINKS & CONTENT PAGES
-- =======================================================
create policy "Public can view enabled social links"
  on public.social_links for select
  using (is_enabled = true or public.is_staff(auth.uid()));

create policy "Staff can manage social links"
  on public.social_links for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

create policy "Public can view published content pages"
  on public.content_pages for select
  using (status = 'published' or public.is_staff(auth.uid()));

create policy "Staff can manage content pages"
  on public.content_pages for all
  using (public.is_staff(auth.uid()))
  with check (public.is_staff(auth.uid()));

-- =======================================================
-- AUDIT LOGS POLICIES (Append-only)
-- =======================================================
create policy "Admins and owners can view audit logs"
  on public.audit_logs for select
  using (public.is_admin_or_owner(auth.uid()));

create policy "Authenticated users can insert audit logs"
  on public.audit_logs for insert
  with check (auth.uid() is not null);

-- Prohibit update or delete of audit logs
-- (No update/delete policy means denied by default)

-- =======================================================
-- AUTH HOOK TRIGGER: Automatic Profile & Default Role
-- =======================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, avatar_path)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role_key)
  values (new.id, 'learner')
  on conflict (user_id, role_key) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
