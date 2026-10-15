-- MindSparQ Education & Technology: First Owner Bootstrap Script
-- Run this in the Supabase SQL Editor AFTER the owner signs up via Auth.
-- Replace 'OWNER_USER_EMAIL_HERE' with the real verified owner email.

do $$
declare
  target_user_id uuid;
begin
  -- Find the user by email
  select id into target_user_id
  from auth.users
  where email = 'OWNER_USER_EMAIL_HERE';

  if target_user_id is null then
    raise exception 'User with email OWNER_USER_EMAIL_HERE not found. Please sign up first.';
  end if;

  -- Grant Owner role
  insert into public.user_roles (user_id, role_key)
  values (target_user_id, 'owner')
  on conflict (user_id, role_key) do nothing;

  -- Also ensure admin role exists if needed
  insert into public.user_roles (user_id, role_key)
  values (target_user_id, 'admin')
  on conflict (user_id, role_key) do nothing;

  -- Log the bootstrap action in audit_logs
  insert into public.audit_logs (actor_user_id, action, target_type, target_id, metadata)
  values (
    target_user_id,
    'role.grant.bootstrap_owner',
    'user_roles',
    target_user_id::text,
    jsonb_build_object('role', 'owner', 'method', 'bootstrap_script')
  );

  raise notice 'Successfully granted owner role to user ID: %', target_user_id;
end;
$$;

-- Verification Query:
-- select u.id, u.email, r.role_key, r.created_at
-- from auth.users u
-- join public.user_roles r on r.user_id = u.id
-- where r.role_key in ('owner', 'admin');
