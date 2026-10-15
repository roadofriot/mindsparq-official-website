-- MindSparQ Education & Technology Database Schema
-- Migration 03: Supabase Storage Buckets & Policies

-- 1. Create Storage Buckets (if not exist)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('public-media', 'public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']),
  ('private-resources', 'private-resources', false, 20971520, array['application/pdf', 'application/zip', 'image/jpeg', 'image/png'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Objects Policies for public-media
create policy "Public media is accessible to all"
  on storage.objects for select
  using (bucket_id = 'public-media');

create policy "Staff can upload public media"
  on storage.objects for insert
  with check (
    bucket_id = 'public-media'
    and public.is_staff(auth.uid())
  );

create policy "Staff can update public media"
  on storage.objects for update
  using (
    bucket_id = 'public-media'
    and public.is_staff(auth.uid())
  );

create policy "Admins and owners can delete public media"
  on storage.objects for delete
  using (
    bucket_id = 'public-media'
    and public.is_admin_or_owner(auth.uid())
  );

-- 3. Storage Objects Policies for private-resources
create policy "Staff and enrolled learners can access private resources"
  on storage.objects for select
  using (
    bucket_id = 'private-resources'
    and (public.is_staff(auth.uid()) or auth.uid() is not null)
  );

create policy "Staff can manage private resources"
  on storage.objects for all
  using (
    bucket_id = 'private-resources'
    and public.is_staff(auth.uid())
  )
  with check (
    bucket_id = 'private-resources'
    and public.is_staff(auth.uid())
  );
