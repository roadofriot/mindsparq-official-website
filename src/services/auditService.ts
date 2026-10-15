import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuditLog } from '../types/database';

export async function recordAuditLog(
  action: string,
  targetType: string,
  targetId: string | null = null,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert([
      {
        actor_user_id: user?.id ?? null,
        actor_email: user?.email ?? null,
        action,
        target_type: targetType,
        target_id: targetId,
        metadata
      }
    ]);
  } catch (err) {
    console.error('[MindSparQ Audit] Failed to record audit log:', err);
  }
}

export async function getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[MindSparQ Audit] Error fetching audit logs:', error);
    return [];
  }

  return (data as AuditLog[]) || [];
}
