-- =============================================================================
-- MindSparQ — APPLY PENDING MIGRATIONS (generated 2026-10-18T02:35:08.898Z)
-- Paste this whole file into Supabase Dashboard › SQL Editor and press "Run".
-- Every statement is idempotent: running it twice is safe.
-- =============================================================================

begin;

-- >>>>>>>>>>>>>>>>>>>> 20261015000004_super_admin_and_multi_author_blog.sql
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

-- >>>>>>>>>>>>>>>>>>>> 20261016000006_curriculum_resources_and_editorial_statuses.sql
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

-- >>>>>>>>>>>>>>>>>>>> 20261016000007_team_profiles_and_governance.sql
-- ==============================================================================
-- Migration: 20261016000007_team_profiles_and_governance.sql
-- MindSparQ Education & Technology (mindsparqeducation.com.np)
-- Public Team Directory, Governed Staff Profiles & Multi-Author Blog Attribution
-- ==============================================================================

-- 1. Create team_profiles table
create table if not exists public.team_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete set null,
  slug text not null unique check (slug ~* '^[a-z0-9-]+$'),
  display_name text not null check (char_length(display_name) <= 100),
  display_name_nepali text null check (char_length(display_name_nepali) <= 150),
  public_title text not null check (char_length(public_title) <= 120),
  public_title_nepali text null check (char_length(public_title_nepali) <= 150),
  team_category text not null default 'teaching' 
    check (team_category in ('leadership', 'teaching', 'program_leads', 'operations', 'advisory')),
  short_bio text not null check (char_length(short_bio) <= 300),
  bio text not null,
  profile_image_path text null check (profile_image_path is null or char_length(profile_image_path) <= 1024),
  
  -- Structured professional credentials (no uncontrolled arbitrary blobs)
  education text null check (char_length(education) <= 250),
  qualifications text[] null,
  teaching_subjects text[] null,
  responsibilities text[] null,
  
  -- Validated social and professional links (JSON object of verified platforms)
  social_links jsonb not null default '{}'::jsonb,
  
  -- Visibility & Governance State Machine
  is_featured_founder boolean not null default false,
  is_public boolean not null default false,
  review_status text not null default 'draft'
    check (review_status in ('draft', 'pending_review', 'changes_requested', 'approved', 'published', 'unpublished')),
  review_notes text null check (char_length(review_notes) <= 1000),
  
  -- Sorting, Lifecycle Timestamps & Audit Attributions
  sort_order integer not null default 0,
  submitted_at timestamptz null,
  reviewed_at timestamptz null,
  reviewed_by uuid references auth.users(id) on delete set null,
  published_at timestamptz null,
  published_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 2. Indexes for fast lookup & filtering
create index if not exists idx_team_profiles_slug on public.team_profiles(slug);
create index if not exists idx_team_profiles_public on public.team_profiles(is_public, review_status, sort_order) 
  where is_public = true and review_status = 'published';
create index if not exists idx_team_profiles_category on public.team_profiles(team_category)
  where is_public = true and review_status = 'published';
create index if not exists idx_team_profiles_user on public.team_profiles(user_id) 
  where user_id is not null;

-- 3. Extend blog_posts to link directly to verified team profiles
alter table public.blog_posts 
  add column if not exists author_profile_id uuid references public.team_profiles(id) on delete set null;

alter table public.blog_posts 
  add column if not exists review_feedback text null check (char_length(review_feedback) <= 1500);

create index if not exists idx_blog_posts_author_profile on public.blog_posts(author_profile_id);

-- 4. Row Level Security Policies for team_profiles
alter table public.team_profiles enable row level security;

-- Public can read approved, published profiles
drop policy if exists "Public can view approved published profiles" on public.team_profiles;
create policy "Public can view approved published profiles"
  on public.team_profiles for select
  using (is_public = true and review_status = 'published');

-- Staff can view all team profiles (including drafts and pending review)
drop policy if exists "Staff can view all team profiles" on public.team_profiles;
create policy "Staff can view all team profiles"
  on public.team_profiles for select
  using (public.is_staff(auth.uid()));

-- Super Admins and Admins can manage all profiles
drop policy if exists "Admins can manage all team profiles" on public.team_profiles;
create policy "Admins can manage all team profiles"
  on public.team_profiles for all
  using (public.is_admin_or_owner(auth.uid()))
  with check (public.is_admin_or_owner(auth.uid()));

-- Staff members can insert their own draft profile
drop policy if exists "Staff can insert own draft profile" on public.team_profiles;
create policy "Staff can insert own draft profile"
  on public.team_profiles for insert
  with check (
    public.is_staff(auth.uid())
    and (
      public.is_admin_or_owner(auth.uid()) or (
        user_id = auth.uid()
        and is_public = false
        and review_status in ('draft', 'pending_review')
      )
    )
  );

-- Staff members can update their own draft/profile fields
drop policy if exists "Staff can update own profile permitted fields" on public.team_profiles;
create policy "Staff can update own profile permitted fields"
  on public.team_profiles for update
  using (user_id = auth.uid() or public.is_admin_or_owner(auth.uid()))
  with check (
    public.is_admin_or_owner(auth.uid()) or (
      user_id = auth.uid()
      and review_status in ('draft', 'pending_review')
    )
  );

-- 5. Seed verified Founder & CEO profile
insert into public.team_profiles (
  slug,
  display_name,
  display_name_nepali,
  public_title,
  public_title_nepali,
  team_category,
  short_bio,
  bio,
  education,
  qualifications,
  teaching_subjects,
  responsibilities,
  social_links,
  is_featured_founder,
  is_public,
  review_status,
  sort_order,
  published_at
) values (
  'samay-budhathoki-chhetri',
  'Samay Budhathoki Chhetri',
  'समय बुढाथोकी क्षेत्री',
  'Founder & CEO',
  'संस्थापक तथा प्रमुख कार्यकारी अधिकृत',
  'leadership',
  'Founder and Chief Executive Officer of MindSparQ Education & Technology. Spearheading the fusion of foundational cognitive development (Abacus, Mental Math) with applied AI, coding, and robotics education across Nepal.',
  'Samay Budhathoki Chhetri (also known as Sonu Chhetri) is an educational innovator, curriculum developer, and the Founder & CEO of MindSparQ Education & Technology, based in Butwal-11, Gyanbhoomi Path, Rupandehi, Nepal.

His academic research investigates "The Effectiveness of VAK-Based Teaching Strategies in Enhancing Learning Outcomes Among Secondary School Students in Butwal Sub-Metropolitan City, Nepal." He champions an evidence-backed pedagogy uniting multimodal tactile and visual learning with 21st-century technological tools.

Under his leadership, MindSparQ has developed structured training frameworks for schools, educators, and young learners, emphasizing computational thinking, ethical artificial intelligence, hands-on robotics, and cognitive agility.',
  'Master of Education / Educational Research',
  array['Certified Abacus Master Trainer', 'VAK Pedagogical Researcher', 'STEM & Robotics Curriculum Developer'],
  array['Abacus & Mental Arithmetic', 'Vedic Mathematics', 'AI & Computational Thinking', 'Educational Methodology'],
  array['Institutional Leadership & Strategy', 'Curriculum Rigor & Pedagogical Research', 'School & Institutional Partnerships', 'Teacher Empowerment Programs'],
  '{"facebook": "https://facebook.com/mindsparqeducation", "instagram": "https://instagram.com/mindsparqeducation", "linkedin": "https://linkedin.com/company/mindsparqeducation", "youtube": "https://youtube.com/@mindsparqeducation"}'::jsonb,
  true,
  true,
  'published',
  1,
  timezone('utc'::text, now())
) on conflict (slug) do update set
  display_name = excluded.display_name,
  display_name_nepali = excluded.display_name_nepali,
  public_title = excluded.public_title,
  public_title_nepali = excluded.public_title_nepali,
  team_category = excluded.team_category,
  short_bio = excluded.short_bio,
  bio = excluded.bio,
  education = excluded.education,
  qualifications = excluded.qualifications,
  teaching_subjects = excluded.teaching_subjects,
  responsibilities = excluded.responsibilities,
  social_links = excluded.social_links,
  is_featured_founder = excluded.is_featured_founder,
  is_public = excluded.is_public,
  review_status = excluded.review_status,
  updated_at = timezone('utc'::text, now());

-- >>>>>>>>>>>>>>>>>>>> 20261017000008_cms_core.sql
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

commit;
