import React, { useState, useEffect } from 'react';
import { listStaffAndUsers, assignUserRole, revokeUserRole, UserWithRoles } from '../../services/userService';
import { RoleKey } from '../../types/database';
import { Users, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser, isOwner } = useAuth();
  const [userList, setUserList] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    listStaffAndUsers()
      .then((data) => setUserList(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAssignRole = async (userId: string) => {
    const role = window.prompt(
      'Enter role to assign (contributor, editor, admin, learner):'
    )?.toLowerCase() as RoleKey;

    if (!role || !['contributor', 'editor', 'admin', 'learner'].includes(role)) {
      if (role) alert('Invalid role. Allowed roles: contributor, editor, admin, learner.');
      return;
    }

    if (role === 'admin' && !isOwner) {
      alert('Only the organization Owner can grant the administrator role.');
      return;
    }

    const { error } = await assignUserRole(userId, role);
    if (!error) {
      setActionMsg(`Assigned role ${role} successfully.`);
      fetchUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } else {
      alert('Role assignment failed: ' + error.message);
    }
  };

  const handleRevokeRole = async (userId: string, roleKey: RoleKey) => {
    if (userId === currentUser?.id && (roleKey === 'owner' || roleKey === 'admin')) {
      alert('Security Protection: You cannot revoke your own administrative privileges.');
      return;
    }

    if (!window.confirm(`Revoke role "${roleKey}" from this account?`)) return;

    const { error } = await revokeUserRole(userId, roleKey);
    if (!error) {
      setActionMsg(`Revoked role ${roleKey} successfully.`);
      fetchUsers();
      setTimeout(() => setActionMsg(null), 3000);
    } else {
      alert('Revoke failed: ' + error.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
          User & Staff Roles Management
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Manage role-based privileges. All role modifications are securely logged in the audit trail.
        </p>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            fontSize: 'var(--font-xs)',
            marginBottom: 'var(--space-4)'
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading user list...
          </div>
        ) : userList.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Users size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No registered profiles found in the database.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Display Name</th>
                <th style={{ padding: 'var(--space-3)' }}>User ID</th>
                <th style={{ padding: 'var(--space-3)' }}>Assigned Roles</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((item) => (
                <tr key={item.profile.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>
                    {item.profile.display_name}
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                    {item.profile.id.slice(0, 13)}...
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.roles.map((r) => (
                        <span
                          key={r}
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor:
                              r === 'owner'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : r === 'admin'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : r === 'editor'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'var(--color-surface-hover)',
                            color:
                              r === 'owner'
                                ? '#ef4444'
                                : r === 'admin'
                                ? '#d97706'
                                : r === 'editor'
                                ? '#3b82f6'
                                : 'var(--color-text)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{r}</span>
                          {r !== 'owner' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeRole(item.profile.id, r)}
                              title="Revoke role"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <button
                      onClick={() => handleAssignRole(item.profile.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Assign Role
                    </button>
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
