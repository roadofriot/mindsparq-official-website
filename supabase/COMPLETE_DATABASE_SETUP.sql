-- ==============================================================================
-- MindSparQ Education & Technology — Complete Unified Database Setup
-- Run this SINGLE script in the Supabase SQL Editor for fresh or existing projects.
-- Fully idempotent: Safe to execute on fresh databases or rerun anytime.
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. CORE SCHEMAS & TABLES

-- 2.1 Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) <= 100),
  avatar_path text null check (avatar_path is null or char_length(avatar_path) <= 1024),
  bio text null check (bio is null or char_length(bio) <= 500),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'deactivated')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Ensure status column exists if updating an existing profiles table
alter table public.profiles add column if not exists status text not null default 'active' 
  check (status in ('active', 'invited', 'suspended', 'deactivated'));

-- 2.2 User Roles Table (Strict RBAC, isolated from client manipulation)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('super_admin', 'owner', 'admin', 'editor', 'contributor', 'learner')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, role_key)
);

-- Ensure super_admin is accepted if table was previously created with older constraint
alter table public.user_roles drop constraint if exists user_roles_role_key_check;
alter table public.user_roles add constraint user_roles_role_key_check 
  check (role_key in ('super_admin', 'owner', 'admin', 'editor', 'contributor', 'learner'));

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_key on public.user_roles(role_key);

-- 2.3 Media Assets Table
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(storage_path) <= 1024),
  original_filename text not null check (char_length(original_filename) <= 255),
  alt_text text not null check (char_length(alt_text) <= 300),
  caption text null check (caption is null or char_length(caption) <= 500),
  media_type text not null check (media_type in ('image', 'document', 'audio')),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  width integer null check (width is null or width > 0),
  height integer null check (height is null or height > 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_media_assets_visibility on public.media_assets(visibility);

-- 2.4 Carousel Items Table
create table if not exists public.carousel_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 200),
  subtitle text null check (subtitle is null or char_length(subtitle) <= 300),
  image_url text not null check (char_length(image_url) <= 1024),
  mobile_image_url text null check (mobile_image_url is null or char_length(mobile_image_url) <= 1024),
  alt_text text not null check (char_length(alt_text) <= 300),
  cta_label text null check (cta_label is null or char_length(cta_label) <= 60),
  cta_url text null check (cta_url is null or cta_url ~* '^(/|https?://)'),
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  starts_at timestamptz null,
  ends_at timestamptz null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_carousel_status_sort on public.carousel_items(status, sort_order);

-- 2.5 Programs Table
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  title text not null check (char_length(title) <= 150),
  summary text not null check (char_length(summary) <= 400),
  description text not null,
  audience text null check (audience is null or char_length(audience) <= 200),
  icon_name text null check (icon_name is null or char_length(icon_name) <= 50),
  cover_image_url text null check (cover_image_url is null or char_length(cover_image_url) <= 1024),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_programs_status_sort on public.programs(status, sort_order);

-- 2.6 Courses Table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  title text not null check (char_length(title) <= 200),
  summary text not null check (char_length(summary) <= 500),
  description text not null,
  cover_image_url text null check (cover_image_url is null or char_length(cover_image_url) <= 1024),
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  estimated_duration text null check (estimated_duration is null or char_length(estimated_duration) <= 100),
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  access_type text not null default 'free' check (access_type in ('free', 'invite_only')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_courses_status_vis on public.courses(status, visibility);

-- 2.7 Course Modules Table
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  description text null check (description is null or char_length(description) <= 500),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_modules_course_sort on public.course_modules(course_id, sort_order);

-- 2.8 Lessons Table
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  slug text not null check (slug ~* '^[a-z0-9-]+$'),
  lesson_type text not null default 'article' check (lesson_type in ('article', 'video', 'resource')),
  body_text text null,
  video_provider text null check (video_provider is null or video_provider in ('youtube', 'vimeo')),
  video_id text null check (video_id is null or video_id ~* '^[a-zA-Z0-9_-]{5,30}$'),
  duration_minutes integer null check (duration_minutes is null or duration_minutes >= 0),
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (module_id, slug)
);

create index if not exists idx_lessons_module_sort on public.lessons(module_id, sort_order);

-- 2.9 Enrollments Table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'revoked')),
  enrolled_at timestamptz not null default timezone('utc'::text, now()),
  completed_at timestamptz null,
  unique (user_id, course_id)
);

create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);

-- 2.10 Lesson Progress Table
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed')),
  last_position_seconds integer not null default 0 check (last_position_seconds >= 0 and last_position_seconds <= 86400),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, lesson_id)
);

create index if not exists idx_progress_user on public.lesson_progress(user_id);

-- 2.11 Blog Posts Table (Multi-author with SEO & audit fields)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  title text not null check (char_length(title) <= 250),
  excerpt text not null check (char_length(excerpt) <= 500),
  content text not null,
  cover_image_url text null check (cover_image_url is null or char_length(cover_image_url) <= 1024),
  author_id uuid references auth.users(id) on delete set null,
  author_name text not null default 'MindSparQ Team' check (char_length(author_name) <= 100),
  category text not null default 'Education' check (char_length(category) <= 50),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  published_at timestamptz null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  seo_title text null check (char_length(seo_title) <= 200),
  seo_description text null check (char_length(seo_description) <= 350),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Ensure SEO and audit columns exist if table was previously created
alter table public.blog_posts add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.blog_posts add column if not exists updated_by uuid references auth.users(id) on delete set null;
alter table public.blog_posts add column if not exists seo_title text null check (char_length(seo_title) <= 200);
alter table public.blog_posts add column if not exists seo_description text null check (char_length(seo_description) <= 350);

create index if not exists idx_blog_status_published on public.blog_posts(status, published_at desc);

-- 2.12 Blog Comments Table (Moderation-first)
create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null check (char_length(author_name) <= 100),
  body text not null check (char_length(body) >= 2 and char_length(body) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'spam')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_comments_post_status on public.blog_comments(post_id, status);

-- 2.13 Content Likes Table
create table if not exists public.content_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('blog_post', 'course')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_likes_target on public.content_likes(target_type, target_id);

-- 2.14 Bookmarks Table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('blog_post', 'course')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- 2.15 Events Table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  title text not null check (char_length(title) <= 200),
  summary text not null check (char_length(summary) <= 400),
  description text not null,
  cover_image_url text null check (cover_image_url is null or char_length(cover_image_url) <= 1024),
  location_text text not null check (char_length(location_text) <= 250),
  starts_at timestamptz not null,
  ends_at timestamptz null,
  registration_url text null check (registration_url is null or registration_url ~* '^https?://'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_events_status_starts on public.events(status, starts_at);

-- 2.16 Inquiries Table
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) <= 100),
  email text not null check (char_length(email) <= 255),
  phone text null check (phone is null or char_length(phone) <= 30),
  subject text not null check (char_length(subject) <= 200),
  message text not null check (char_length(message) <= 3000),
  program_interest text null check (program_interest is null or char_length(program_interest) <= 100),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'archived')),
  notes text null,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_inquiries_status on public.inquiries(status);

-- 2.17 Social Links Table
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok', 'youtube', 'linkedin')),
  profile_url text not null check (profile_url ~* '^https?://'),
  display_label text not null check (char_length(display_label) <= 100),
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2.18 Content Pages Table
create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  title text not null check (char_length(title) <= 200),
  content_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2.19 Audit Logs Table (Immutable activity records)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text null,
  action text not null check (char_length(action) <= 100),
  target_type text not null check (char_length(target_type) <= 100),
  target_id text null check (char_length(target_id) <= 100),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_audit_created_at on public.audit_logs(created_at desc);
create index if not exists idx_audit_actor on public.audit_logs(actor_user_id);


-- 3. SECURITY DEFINER HELPER FUNCTIONS

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


-- 4. PROFILE AUTO-CREATION TRIGGER
-- When a user signs in with Google, GitHub, or Email, create their profile automatically

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (id, display_name, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'MindSparQ Learner'),
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
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
alter table public.inquiries enable row level security;
alter table public.social_links enable row level security;
alter table public.content_pages enable row level security;
alter table public.audit_logs enable row level security;

-- 5.1 Profiles Policies
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins and Super Admins can update any profile" on public.profiles;
create policy "Admins and Super Admins can update any profile"
  on public.profiles for update using (public.is_admin_or_owner(auth.uid()));

-- 5.2 User Roles Policies
drop policy if exists "Admins and Super Admins can view user roles" on public.user_roles;
create policy "Admins and Super Admins can view user roles"
  on public.user_roles for select using (public.is_admin_or_owner(auth.uid()));

drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
  on public.user_roles for select using (auth.uid() = user_id);

drop policy if exists "Admins and Super Admins can manage user roles" on public.user_roles;
create policy "Admins and Super Admins can manage user roles"
  on public.user_roles for all using (public.is_admin_or_owner(auth.uid()));

-- 5.3 Blog Posts Policies (Multi-author granular workflow)
drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
  on public.blog_posts for select
  using (status = 'published');

drop policy if exists "Staff can read all blog posts" on public.blog_posts;
create policy "Staff can read all blog posts"
  on public.blog_posts for select
  using (public.is_staff(auth.uid()));

drop policy if exists "Staff can create blog posts" on public.blog_posts;
create policy "Staff can create blog posts"
  on public.blog_posts for insert
  with check (
    public.is_staff(auth.uid())
    and (
      public.is_admin_or_owner(auth.uid())
      or status in ('draft', 'review')
    )
  );

drop policy if exists "Staff can update blog posts" on public.blog_posts;
create policy "Staff can update blog posts"
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

drop policy if exists "Admins and Super Admins can delete blog posts" on public.blog_posts;
create policy "Admins and Super Admins can delete blog posts"
  on public.blog_posts for delete
  using (public.is_admin_or_owner(auth.uid()));

-- 5.4 Media Assets Policies
drop policy if exists "Public can view public media" on public.media_assets;
create policy "Public can view public media"
  on public.media_assets for select using (visibility = 'public');

drop policy if exists "Staff can view all media" on public.media_assets;
create policy "Staff can view all media"
  on public.media_assets for select using (public.is_staff(auth.uid()));

drop policy if exists "Staff can insert media" on public.media_assets;
create policy "Staff can insert media"
  on public.media_assets for insert with check (public.is_staff(auth.uid()));

drop policy if exists "Admins can manage media" on public.media_assets;
create policy "Admins can manage media"
  on public.media_assets for all using (public.is_admin_or_owner(auth.uid()));

-- 5.5 Carousel Items Policies
drop policy if exists "Public can view published carousel items" on public.carousel_items;
create policy "Public can view published carousel items"
  on public.carousel_items for select using (status = 'published');

drop policy if exists "Staff can view all carousel items" on public.carousel_items;
create policy "Staff can view all carousel items"
  on public.carousel_items for select using (public.is_staff(auth.uid()));

drop policy if exists "Admins can manage carousel items" on public.carousel_items;
create policy "Admins can manage carousel items"
  on public.carousel_items for all using (public.is_admin_or_owner(auth.uid()));

-- 5.6 Programs Policies
drop policy if exists "Public can view published programs" on public.programs;
create policy "Public can view published programs"
  on public.programs for select using (status = 'published');

drop policy if exists "Staff can view all programs" on public.programs;
create policy "Staff can view all programs"
  on public.programs for select using (public.is_staff(auth.uid()));

drop policy if exists "Admins can manage programs" on public.programs;
create policy "Admins can manage programs"
  on public.programs for all using (public.is_admin_or_owner(auth.uid()));

-- 5.7 Inquiries Policies
drop policy if exists "Anyone can submit an inquiry" on public.inquiries;
create policy "Anyone can submit an inquiry"
  on public.inquiries for insert with check (true);

drop policy if exists "Staff can view inquiries" on public.inquiries;
create policy "Staff can view inquiries"
  on public.inquiries for select using (public.is_staff(auth.uid()));

drop policy if exists "Staff can update inquiries" on public.inquiries;
create policy "Staff can update inquiries"
  on public.inquiries for update using (public.is_staff(auth.uid()));

-- 5.8 Audit Logs Policies
drop policy if exists "Admins and Super Admins can view audit logs" on public.audit_logs;
create policy "Admins and Super Admins can view audit logs"
  on public.audit_logs for select using (public.is_admin_or_owner(auth.uid()));

drop policy if exists "Staff can insert audit logs" on public.audit_logs;
create policy "Staff can insert audit logs"
  on public.audit_logs for insert with check (public.is_staff(auth.uid()));


-- 6. STORAGE BUCKETS (public-media & private-resources)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('public-media', 'public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('private-resources', 'private-resources', false, 20971520, array['application/pdf', 'application/zip', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies
drop policy if exists "Public media is accessible to all" on storage.objects;
create policy "Public media is accessible to all"
  on storage.objects for select
  using (bucket_id = 'public-media');

drop policy if exists "Staff can upload public media" on storage.objects;
create policy "Staff can upload public media"
  on storage.objects for insert
  with check (
    bucket_id = 'public-media'
    and public.is_staff(auth.uid())
  );

drop policy if exists "Staff can update public media" on storage.objects;
create policy "Staff can update public media"
  on storage.objects for update
  using (
    bucket_id = 'public-media'
    and public.is_staff(auth.uid())
  );

drop policy if exists "Admins and owners can delete public media" on storage.objects;
create policy "Admins and owners can delete public media"
  on storage.objects for delete
  using (
    bucket_id = 'public-media'
    and public.is_admin_or_owner(auth.uid())
  );

-- ==============================================================================
-- SETUP COMPLETE
-- All tables, constraints, functions, RLS policies, and storage buckets are ready!
-- ==============================================================================
