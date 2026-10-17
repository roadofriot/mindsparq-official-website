import React, { useState, useEffect } from 'react';
import {
  listStaffAndUsers,
  assignUserRole,
  revokeUserRole,
  updateUserStatus,
  inviteStaffMember,
  UserWithRoles
} from '../../services/userService';
import { RoleKey, AuditLog } from '../../types/database';
import { getAuditLogs } from '../../services/auditService';
import {
  ROLE_PERMISSIONS,
  CAPABILITY_DEFINITIONS,
  ROLE_DEFINITIONS
} from '../../lib/permissions';
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Check,
  Minus,
  History,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


export const AdminUsersPage: React.FC = () => {
  const { user: currentUser, isOwner, isSuperAdmin } = useAuth();
  const [userList, setUserList] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab & Matrix Navigation State
  const [activeTab, setActiveTab] = useState<'team' | 'matrix' | 'audit'>('team');
  const [domainFilter, setDomainFilter] = useState<'all' | 'content' | 'media' | 'curriculum' | 'system'>('all');
  const [selectedMatrixRole, setSelectedMatrixRole] = useState<RoleKey | null>(null);

  // Role Audit Logs State
  const [roleAuditLogs, setRoleAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<RoleKey>('editor');
  const [inviting, setInviting] = useState(false);

  // Role Assignment Modal State
  const [roleModalUser, setRoleModalUser] = useState<UserWithRoles | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<RoleKey>('editor');

  const fetchUsers = () => {
    setLoading(true);
    listStaffAndUsers()
      .then((data) => setUserList(data))
      .finally(() => setLoading(false));
  };

  const fetchAuditLogs = () => {
    setLoadingAudit(true);
    getAuditLogs(100)
      .then((logs) => {
        const filtered = logs.filter(
          (l) => l.action.startsWith('role.') || l.action.startsWith('user.')
        );
        setRoleAuditLogs(filtered);
      })
      .finally(() => setLoadingAudit(false));
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, []);

  const roleMemberCounts = React.useMemo(() => {
    const counts: Record<RoleKey, number> = {
      super_admin: 0,
      owner: 0,
      admin: 0,
      editor: 0,
      contributor: 0,
      learner: 0
    };
    userList.forEach((u) => {
      u.roles.forEach((r) => {
        if (counts[r] !== undefined) {
          counts[r]++;
        }
      });
    });
    return counts;
  }, [userList]);

  const filteredCapabilities = React.useMemo(() => {
    if (domainFilter === 'all') return CAPABILITY_DEFINITIONS;
    return CAPABILITY_DEFINITIONS.filter((c) => c.domain === domainFilter);
  }, [domainFilter]);


  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    setInviting(true);
    const { error } = await inviteStaffMember(inviteEmail, inviteName, inviteRole);
    setInviting(false);

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification(`Invitation prepared for ${inviteEmail} with role ${inviteRole}. Audit logged.`);
      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('editor');
      fetchUsers();
    }
  };

  const handleAssignRole = async () => {
    if (!roleModalUser) return;
    const { error } = await assignUserRole(roleModalUser.profile.id, selectedNewRole);
    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification(`Granted role "${selectedNewRole}" to ${roleModalUser.profile.display_name}.`);
      setRoleModalUser(null);
      fetchUsers();
    }
  };

  const handleRevokeRole = async (userId: string, roleKey: RoleKey, displayName: string) => {
    if (userId === currentUser?.id && ['super_admin', 'owner', 'admin'].includes(roleKey)) {
      showNotification('Security Protection: You cannot revoke your own administrative privileges.', 'error');
      return;
    }

    if (!window.confirm(`Revoke role "${roleKey}" from ${displayName}?`)) return;

    const { error } = await revokeUserRole(userId, roleKey);
    if (!error) {
      showNotification(`Revoked role "${roleKey}" from ${displayName}.`);
      fetchUsers();
    } else {
      showNotification(`Revoke failed: ${error.message}`, 'error');
    }
  };

  const handleToggleStatus = async (userItem: UserWithRoles, newStatus: 'active' | 'suspended' | 'deactivated') => {
    if (userItem.profile.id === currentUser?.id) {
      showNotification('Security Protection: You cannot suspend or deactivate your own account.', 'error');
      return;
    }

    const actionWord = newStatus === 'active' ? 'Reactivate' : newStatus === 'suspended' ? 'Suspend' : 'Deactivate';
    if (!window.confirm(`${actionWord} account for ${userItem.profile.display_name}? Historical blog post attribution will be strictly preserved.`)) {
      return;
    }

    const { error } = await updateUserStatus(userItem.profile.id, newStatus);
    if (!error) {
      showNotification(`Account ${newStatus} successfully for ${userItem.profile.display_name}.`);
      fetchUsers();
    } else {
      showNotification(`Status change failed: ${error.message}`, 'error');
    }
  };

  // Filtered List
  const filteredUsers = userList.filter((item) => {
    const nameMatch = item.profile.display_name.toLowerCase().includes(searchQuery.toLowerCase());
    const idMatch = item.profile.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || idMatch;

    const matchesRole =
      roleFilter === 'All'
        ? true
        : roleFilter === 'super_admin'
        ? item.roles.includes('super_admin') || item.roles.includes('owner')
        : item.roles.includes(roleFilter as RoleKey);

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : (item.profile.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: RoleKey) => {
    switch (role) {
      case 'super_admin':
      case 'owner':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Super Admin' };
      case 'admin':
        return { bg: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', label: 'Admin' };
      case 'editor':
        return { bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', label: 'Editor' };
      case 'contributor':
        return { bg: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', label: 'Contributor' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Learner' };
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'suspended':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Suspended' };
      case 'deactivated':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Deactivated' };
      default:
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Active' };
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8'
              }}
            >
              Access Control
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Server-Enforced RBAC
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px' }}>
            Team & Access Management
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>
            Manage staff credentials, role-based privileges, and account states. Privileged actions are cryptographically recorded in the audit log.
          </p>
        </div>

        {/* Primary Action Button */}
        {(isOwner || isSuperAdmin) && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <UserPlus size={16} />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      {/* Action Notification Banner */}
      {actionMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: actionMsg.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${actionMsg.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: actionMsg.type === 'success' ? '#22c55e' : '#ef4444',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'team' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'team' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'team' ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <Users size={16} />
          <span>Team Directory ({userList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matrix')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'matrix' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'matrix' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'matrix' ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={16} />
          <span>Role-Permission Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'audit' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          <History size={16} />
          <span>Role Delegation Audit</span>
        </button>
      </div>

      {activeTab === 'team' && (
        <>
          {/* Filters & Search Toolbar */}
          <div
            className="card"

        style={{
          padding: '16px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search team member by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 12px 0 40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          >
            <option value="All">All Roles</option>
            <option value="super_admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="editor">Editors</option>
            <option value="contributor">Contributors</option>
            <option value="learner">Learners</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Users Table Card */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading team & staff records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Users size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-3)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>No users match the criteria</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-4)' }}>
              Try adjusting your search keywords or role filters.
            </p>
            {(isOwner || isSuperAdmin) && (
              <button
                type="button"
                onClick={() => setIsInviteOpen(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Invite Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="admin-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem', minWidth: '780px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Assigned Roles</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Joined Date</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const statusInfo = getStatusBadge(item.profile.status);
                  const isCurrent = item.profile.id === currentUser?.id;
                  const isUserSuperAdmin = item.roles.includes('super_admin') || item.roles.includes('owner');

                  return (
                    <tr
                      key={item.profile.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      {/* Name & ID */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#38bdf8',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              flexShrink: 0
                            }}
                          >
                            {item.profile.display_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {item.profile.display_name}
                              {isCurrent && (
                                <span style={{ marginLeft: '6px', fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 700 }}>
                                  (You)
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                              ID: {item.profile.id.substring(0, 12)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {item.roles.map((r) => {
                            const badge = getRoleBadge(r);
                            return (
                              <span
                                key={r}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  backgroundColor: badge.bg,
                                  color: badge.color,
                                  fontSize: '0.6875rem',
                                  fontWeight: 600
                                }}
                              >
                                {r === 'super_admin' || r === 'owner' ? <ShieldCheck size={11} /> : null}
                                <span>{badge.label}</span>
                                {(isOwner || isSuperAdmin) && !isCurrent && item.roles.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeRole(item.profile.id, r, item.profile.display_name)}
                                    title={`Revoke ${r}`}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: badge.color,
                                      cursor: 'pointer',
                                      padding: '0 2px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            fontSize: '0.6875rem',
                            fontWeight: 600
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: statusInfo.color
                            }}
                          />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                        {item.profile.created_at ? new Date(item.profile.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        {(isOwner || isSuperAdmin) && !isCurrent && !isUserSuperAdmin ? (
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setRoleModalUser(item);
                                setSelectedNewRole('editor');
                              }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-surface-elevated)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Add Role
                            </button>

                            {item.profile.status === 'suspended' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item, 'active')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  border: '1px solid rgba(34, 197, 94, 0.3)',
                                  color: '#22c55e',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Reactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item, 'suspended')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  color: '#f59e0b',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Suspend
                              </button>
                            )}

                            {item.profile.status !== 'deactivated' && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item, 'deactivated')}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer'
                                }}
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {isCurrent ? 'Current Session' : 'Protected Super Admin'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* =========================================================================
          TAB 2: ROLE-PERMISSION MATRIX
      ========================================================================= */}
      {activeTab === 'matrix' && (
        <div>
          {/* Institutional Safeguard Callout */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}
          >
            <ShieldCheck size={24} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Server-Enforced Role-Based Access Control (RBAC)
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Every administrative capability is strictly enforced at the PostgreSQL database layer via Row Level Security (RLS) policies.
                Super Admin and Owner roles are protected against accidental demotion. All privilege changes are cryptographically recorded in the system audit trail.
              </p>
            </div>
          </div>

          {/* Role Overview Tier Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)'
            }}
          >
            {(Object.keys(ROLE_DEFINITIONS) as RoleKey[]).map((rKey) => {
              const def = ROLE_DEFINITIONS[rKey];
              const count = roleMemberCounts[rKey] || 0;
              const isSelected = selectedMatrixRole === rKey;

              return (
                <div
                  key={rKey}
                  onClick={() => setSelectedMatrixRole(isSelected ? null : rKey)}
                  className="card"
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'var(--color-surface)',
                    border: `1px solid ${isSelected ? '#38bdf8' : 'var(--color-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: def.badgeBg,
                        color: def.badgeColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {def.isProtected && <Lock size={10} />}
                      <span>{def.label}</span>
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      Tier {def.level}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {count} {count === 1 ? 'Member' : 'Members'}
                  </div>

                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: '0 0 10px', minHeight: '32px' }}>
                    {def.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {ROLE_PERMISSIONS[rKey].length} Capabilities
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleFilter(rKey);
                        setActiveTab('team');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>Filter Team</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Domain Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
              Filter by Domain:
            </span>
            {[
              { id: 'all', label: 'All Capabilities' },
              { id: 'content', label: 'Content & Editorial' },
              { id: 'media', label: 'Media & Storage' },
              { id: 'curriculum', label: 'Curriculum & Workshops' },
              { id: 'system', label: 'System & Governance' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomainFilter(d.id as any)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: domainFilter === d.id ? '1px solid #2563eb' : '1px solid var(--color-border)',
                  backgroundColor: domainFilter === d.id ? '#2563eb' : 'var(--color-surface)',
                  color: domainFilter === d.id ? '#ffffff' : 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Interactive Matrix Table */}
          <div
            className="card"
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              overflowX: 'auto'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '12px 14px', width: '30%' }}>Capability & Security Scope</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Learner</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Contributor</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Editor</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Admin</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} color="#ef4444" />
                      <span>Super Admin</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCapabilities.map((cap, idx) => {
                  return (
                    <tr
                      key={cap.key}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {cap.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {cap.description}
                        </div>
                        <div style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>
                          {cap.key}
                        </div>
                      </td>

                      {(['learner', 'contributor', 'editor', 'admin', 'super_admin'] as RoleKey[]).map((rKey) => {
                        const hasCap = ROLE_PERMISSIONS[rKey].includes(cap.key);

                        return (
                          <td key={rKey} style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {hasCap ? (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10b981'
                                }}
                                title={`${cap.label} is GRANTED to ${ROLE_DEFINITIONS[rKey].label}`}
                              >
                                <Check size={14} />
                              </span>
                            ) : (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '50%',
                                  color: 'var(--color-text-muted)'
                                }}
                                title={`${cap.label} is DENIED to ${ROLE_DEFINITIONS[rKey].label}`}
                              >
                                <Minus size={14} />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ROLE DELEGATION AUDIT LOG
      ========================================================================= */}
      {activeTab === 'audit' && (
        <div
          className="card"
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            overflowX: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                Role Delegation & Privilege History
              </h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Chronological security log of role grants, revocations, and account status updates.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchAuditLogs}
              disabled={loadingAudit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-elevated)',
                color: 'var(--color-text-primary)',
                fontSize: '0.8125rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={loadingAudit ? 'spin' : ''} />
              <span>Refresh Log</span>
            </button>
          </div>

          {loadingAudit ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Loading audit entries...
            </div>
          ) : roleAuditLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No role delegation audit events recorded yet. Role assignments and revocations will be listed here.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px' }}>Timestamp</th>
                  <th style={{ padding: '10px 12px' }}>Action</th>
                  <th style={{ padding: '10px 12px' }}>Target User</th>
                  <th style={{ padding: '10px 12px' }}>Details</th>
                  <th style={{ padding: '10px 12px' }}>Initiator</th>
                </tr>
              </thead>
              <tbody>
                {roleAuditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor:
                            log.action === 'role.assign'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : log.action === 'role.revoke'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(56, 189, 248, 0.15)',
                          color:
                            log.action === 'role.assign'
                              ? '#10b981'
                              : log.action === 'role.revoke'
                              ? '#ef4444'
                              : '#38bdf8'
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-primary)' }}>
                      {log.target_id || 'N/A'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {JSON.stringify(log.metadata || {})}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      {log.actor_email || log.actor_user_id || 'System'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Invite Member Modal */}

      {isInviteOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Invite Team Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aayush Sharma"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@mindsparqeducation.com.np"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Assigned Staff Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as RoleKey)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="editor">Editor (Can edit drafts, review, and author posts)</option>
                  <option value="contributor">Contributor (Can author and submit drafts)</option>
                  <option value="admin">Administrator (Can publish, manage courses, and review)</option>
                </select>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Super Admin role is intentionally omitted. Super Admins must be bootstrapped via secure database procedure.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: inviting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {inviting ? 'Sending...' : 'Confirm & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {roleModalUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border)'
            }}
          >
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 8px' }}>
              Assign Role to {roleModalUser.profile.display_name}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 16px' }}>
              Select a role to grant. If granting an administrative tier, ensure authorization has been approved.
            </p>

            <div style={{ marginBottom: '18px' }}>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value as RoleKey)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="contributor">Contributor (Author & submit drafts)</option>
                <option value="editor">Editor (Author, edit drafts, review)</option>
                <option value="admin">Administrator (Publish & manage modules)</option>
                <option value="learner">Learner (General platform access)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignRole}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Grant Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
