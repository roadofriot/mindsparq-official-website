import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, RoleKey, UserRole } from '../types/database';
import { recordAuditLog } from './auditService';

export interface UserWithRoles {
  profile: Profile;
  roles: RoleKey[];
}

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
    return profiles.map((p) => ({ profile: p as Profile, roles: ['learner'] }));
  }

  const rolesMap = new Map<string, RoleKey[]>();
  (rolesData as UserRole[]).forEach((r) => {
    const list = rolesMap.get(r.user_id) || [];
    list.push(r.role_key);
    rolesMap.set(r.user_id, list);
  });

  return (profiles as Profile[]).map((p) => ({
    profile: p,
    roles: rolesMap.get(p.id) || ['learner']
  }));
}

export async function assignUserRole(
  userId: string,
  roleKey: RoleKey
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('user_roles')
    .insert([
      {
        user_id: userId,
        role_key: roleKey,
        granted_by: user?.id || null
      }
    ]);

  if (!error) {
    await recordAuditLog('role.assign', 'user_roles', userId, { role_key: roleKey });
  }

  return { error };
}

export async function revokeUserRole(
  userId: string,
  roleKey: RoleKey
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { error: new Error('Supabase is not configured.') };
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_key', roleKey);

  if (!error) {
    await recordAuditLog('role.revoke', 'user_roles', userId, { role_key: roleKey });
  }

  return { error };
}

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
