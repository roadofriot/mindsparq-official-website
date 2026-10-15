import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/auditService';
import { AuditLog } from '../../types/database';
import { ShieldAlert, RefreshCw, Clock } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    getAuditLogs(100)
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Security Audit Trail
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Immutable activity log tracking privileged actions, content updates, role assignments, and moderation events.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading audit trail...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <ShieldAlert size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No audit log entries recorded yet.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Timestamp</th>
                <th style={{ padding: 'var(--space-3)' }}>Actor</th>
                <th style={{ padding: 'var(--space-3)' }}>Action</th>
                <th style={{ padding: 'var(--space-3)' }}>Target</th>
                <th style={{ padding: 'var(--space-3)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>
                    {log.actor_email || 'System / Anonymous'}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border)',
                        fontWeight: 600,
                        fontFamily: 'monospace'
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                    {log.target_type} {log.target_id ? `(${log.target_id.slice(0, 8)}...)` : ''}
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontFamily: 'monospace', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
