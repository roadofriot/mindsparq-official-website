-- MindSparQ Education & Technology: Super Admin / First Owner Bootstrap Script
-- Run this in your Supabase Project SQL Editor AFTER the owner signs up via Auth.
-- Replace 'OWNER_USER_EMAIL_HERE' with the real verified owner email.

do $$
declare
  target_user_id uuid;
begin
  -- 1. Find the target user by verified email
  select id into target_user_id
  from auth.users
  where email = 'OWNER_USER_EMAIL_HERE';

  if target_user_id is null then
    raise exception 'User with email OWNER_USER_EMAIL_HERE not found in auth.users. Please sign up or create account first.';
  end if;

  -- 2. Grant super_admin & owner role
  insert into public.user_roles (user_id, role_key)
  values 
    (target_user_id, 'super_admin'),
    (target_user_id, 'owner'),
    (target_user_id, 'admin')
  on conflict (user_id, role_key) do nothing;

  -- 3. Ensure profile exists and is active
  insert into public.profiles (id, display_name, status)
  values (target_user_id, 'MindSparQ Super Admin', 'active')
  on conflict (id) do update set status = 'active';

  -- 4. Record tamper-evident audit event
  insert into public.audit_logs (actor_user_id, actor_email, action, target_type, target_id, metadata)
  values (
    target_user_id,
    'OWNER_USER_EMAIL_HERE',
    'role.grant.bootstrap_super_admin',
    'user_roles',
    target_user_id::text,
    jsonb_build_object('roles', jsonb_build_array('super_admin', 'owner', 'admin'), 'method', 'bootstrap_script')
  );

  raise notice 'Successfully granted Super Admin privileges to user ID: %', target_user_id;
end;
$$;

-- Verification Query:
-- select u.id, u.email, r.role_key, p.status, r.created_at
-- from auth.users u
-- join public.user_roles r on r.user_id = u.id
-- join public.profiles p on p.id = u.id
-- where r.role_key in ('super_admin', 'owner', 'admin');

