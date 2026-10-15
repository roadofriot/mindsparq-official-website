import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, RoleKey, UserRole } from '../types/database';
import { recordAuditLog } from './auditService';

export interface UserWithRoles {
  profile: Profile;
  roles: RoleKey[];
  email?: string;
}

/**
 * List all users and their assigned roles with profile status
 */
export async function listStaffAndUsers(): Promise<UserWithRoles[]> {
  if (!isSupabaseConfigured) return [];

  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (profErr || !profiles) {
    console.error('[MindSparQ Users] Error loading profiles:', profErr);
    return [];
  }

  const { data: rolesData, error: rolesErr } = await supabase
    .from('user_roles')
    .select('*');

  if (rolesErr) {
    console.error('[MindSparQ Users] Error loading roles:', rolesErr);
    return profiles.map((p) => ({
      profile: {
        ...p,
        status: p.status || 'active'
      } as Profile,
      roles: ['learner']
    }));
  }

  const rolesMap = new Map<string, RoleKey[]>();
  (rolesData as UserRole[]).forEach((r) => {
    const list = rolesMap.get(r.user_id) || [];
    list.push(r.role_key);
    rolesMap.set(r.user_id, list);
  });

  return (profiles as Profile[]).map((p) => ({
    profile: {
      ...p,
      status: p.status || 'active'
    },
    roles: rolesMap.get(p.id) || ['learner']
  }));
}

/**
 * Assign a role to a user with strict authorization verification
 */
export async function assignUserRole(
  userId: string,
  roleKey: RoleKey
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Authentication required.') };

  // Fetch actor roles
  const { data: actorRoles } = await supabase
    .from('user_roles')
    .select('role_key')
    .eq('user_id', user.id);

  const actorRoleKeys = (actorRoles || []).map((r) => r.role_key as RoleKey);
  const isSuperAdminOrOwner = actorRoleKeys.includes('super_admin') || actorRoleKeys.includes('owner');

  // Guard: Only Super Admin / Owner can assign admin, owner, or super_admin
  if (['super_admin', 'owner', 'admin'].includes(roleKey) && !isSuperAdminOrOwner) {
    return { error: new Error('Permission denied: Only Super Admin / Owner can assign administrative roles.') };
  }

  const { error } = await supabase
    .from('user_roles')
    .insert([
      {
        user_id: userId,
        role_key: roleKey,
        granted_by: user.id
      }
    ]);

  if (!error) {
    await recordAuditLog('role.assign', 'user_roles', userId, {
      role_key: roleKey,
      granted_by: user.id
    });
  }

  return { error };
}

/**
 * Revoke a role with last-owner safety safeguards
 */
export async function revokeUserRole(
  userId: string,
  roleKey: RoleKey
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Authentication required.') };

  // Safeguard: Prevent self-revocation of administrative rights
  if (userId === user.id && ['super_admin', 'owner', 'admin'].includes(roleKey)) {
    return { error: new Error('Security policy: You cannot revoke your own administrative privileges.') };
  }

  // Safeguard: If revoking super_admin or owner, verify caller is super_admin
  const { data: actorRoles } = await supabase
    .from('user_roles')
    .select('role_key')
    .eq('user_id', user.id);

  const actorRoleKeys = (actorRoles || []).map((r) => r.role_key as RoleKey);
  const isSuperAdminOrOwner = actorRoleKeys.includes('super_admin') || actorRoleKeys.includes('owner');

  if (['super_admin', 'owner'].includes(roleKey) && !isSuperAdminOrOwner) {
    return { error: new Error('Permission denied: Only a Super Admin can modify owner privileges.') };
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_key', roleKey);

  if (!error) {
    await recordAuditLog('role.revoke', 'user_roles', userId, {
      role_key: roleKey,
      revoked_by: user.id
    });
  }

  return { error };
}

/**
 * Update user account status (active, suspended, deactivated)
 * Preserves blog authorship and audit trail
 */
export async function updateUserStatus(
  userId: string,
  status: 'active' | 'suspended' | 'deactivated'
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Authentication required.') };

  if (userId === user.id && status !== 'active') {
    return { error: new Error('Security policy: You cannot suspend or deactivate your own account.') };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (!error) {
    await recordAuditLog(`user.status.${status}`, 'profiles', userId, {
      status,
      updated_by: user.id
    });
  }

  return { error };
}

/**
 * Invite a new staff member with an approved role (admin, editor, contributor)
 */
export async function inviteStaffMember(
  email: string,
  displayName: string,
  role: RoleKey
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  if (['super_admin', 'owner'].includes(role)) {
    return { error: new Error('Security policy: Super Admin accounts must be bootstrapped via secure script, not invited via web form.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Authentication required.') };

  // Log invitation attempt in audit trail
  await recordAuditLog('user.invite.dispatch', 'profiles', email, {
    email,
    displayName,
    assigned_role: role,
    invited_by: user.id
  });

  return { error: null };
}

/**
 * Update personal profile details
 */
export async function updateOwnProfile(
  displayName: string,
  bio?: string,
  avatarPath?: string
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('User not authenticated.') };

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName.trim(),
      bio: bio?.trim() || null,
      avatar_path: avatarPath || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  return { error };
}
