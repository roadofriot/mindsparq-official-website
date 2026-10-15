-- MindSparQ Education & Technology Database Schema
-- Migration 01: Core Tables & Constraints

-- Enable UUID extension
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles Table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) <= 100),
  avatar_path text null check (avatar_path is null or char_length(avatar_path) <= 1024),
  bio text null check (bio is null or char_length(bio) <= 500),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. User Roles Table (Strict RBAC, isolated from client manipulation)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null check (role_key in ('owner', 'admin', 'editor', 'contributor', 'learner')),
  granted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, role_key)
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_role_key on public.user_roles(role_key);

-- 3. Media Assets Table
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (char_length(storage_path) <= 1024),
  original_filename text not null check (char_length(original_filename) <= 255),
  alt_text text not null check (char_length(alt_text) <= 300),
  caption text null check (caption is null or char_length(caption) <= 500),
  media_type text not null check (media_type in ('image', 'document', 'audio')),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760), -- max 10MB
  width integer null check (width is null or width > 0),
  height integer null check (height is null or height > 0),
  uploaded_by uuid not null references auth.users(id) on delete set null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_media_assets_visibility on public.media_assets(visibility);

-- 4. Carousel Items Table
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

-- 5. Programs Table
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

-- 6. Courses Table (Free enrollments initially)
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

-- 7. Course Modules Table
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

-- 8. Lessons Table
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

-- 9. Enrollments Table
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

-- 10. Lesson Progress Table
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

-- 11. Blog Posts Table
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
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_blog_status_published on public.blog_posts(status, published_at desc);

-- 12. Blog Comments Table (Moderation-first)
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

-- 13. Content Likes Table
create table if not exists public.content_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('blog_post', 'course')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_likes_target on public.content_likes(target_type, target_id);

-- 14. Bookmarks Table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('blog_post', 'course')),
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- 15. Events Table
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

-- 16. Social Links Table (Verified public profile links)
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook', 'instagram', 'tiktok', 'youtube', 'linkedin')),
  profile_url text not null check (profile_url ~* '^https?://'),
  display_label text not null check (char_length(display_label) <= 100),
  is_enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 17. Content Pages Table (Editable page blocks)
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

-- 18. Audit Logs Table (Immutable activity records)
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
