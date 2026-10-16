-- ==============================================================================
-- Migration: 20261016000006_curriculum_resources_and_editorial_statuses.sql
-- MindSparQ Education & Technology (mindsparqeducation.com.np)
-- Supports age targeting, downloadable syllabus attachments, and editorial lifecycle
-- ==============================================================================

-- 1. Courses: Add age group targeting
alter table public.courses add column if not exists age_group text not null default 'all_ages'
  check (age_group in ('elementary', 'middle_school', 'high_school', 'all_ages'));

create index if not exists idx_courses_age_group on public.courses(age_group);

-- 2. Lessons: Add downloadable resource attachments (worksheet PDF, Scratch files, etc.)
alter table public.lessons add column if not exists resource_url text null check (resource_url is null or char_length(resource_url) <= 1024);
alter table public.lessons add column if not exists resource_title text null check (resource_title is null or char_length(resource_title) <= 255);
alter table public.lessons add column if not exists resource_type text null check (resource_type is null or char_length(resource_type) <= 50);

-- 3. Blog Posts: Support formal multi-author editorial review lifecycle
alter table public.blog_posts drop constraint if exists blog_posts_status_check;
alter table public.blog_posts add constraint blog_posts_status_check 
  check (status in ('draft', 'review', 'in_review', 'approved', 'published', 'archived'));

create index if not exists idx_blog_posts_status_published on public.blog_posts(status) where status = 'published';
create index if not exists idx_blog_posts_status_editorial on public.blog_posts(status) where status in ('review', 'in_review', 'approved');
