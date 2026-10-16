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
