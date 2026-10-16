import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search, 
  ExternalLink, 
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { 
  getAllTeamProfiles, 
  reviewTeamProfile, 
  deleteTeamProfile, 
  saveTeamProfileDraft 
} from '../../services/teamService';
import { TeamProfile, TeamCategory } from '../../types/database';

export const AdminTeamProfilesPage: React.FC = () => {
  const { user, isSuperAdmin, isOwner } = useAuth();
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending_review' | 'published' | 'changes_requested' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Profile Modal State
  const [newProfileModalOpen, setNewProfileModalOpen] = useState(false);
  const [newProfileData, setNewProfileData] = useState<Partial<TeamProfile>>({
    display_name: '',
    display_name_nepali: '',
    public_title: '',
    team_category: 'teaching',
    short_bio: '',
    bio: '',
    is_public: false,
    review_status: 'draft'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllTeamProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('[MindSparQ Team Admin] Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (profileId: string) => {
    if (!user) return;
    setActionLoading(true);
    setMessage(null);

    const { success, error } = await reviewTeamProfile(profileId, 'approve', user.id);
    setActionLoading(false);

    if (error || !success) {
      setMessage({ type: 'error', text: error?.message || 'Failed to approve profile.' });
    } else {
      setMessage({ type: 'success', text: 'Profile approved and published live!' });
      await loadData();
    }
  };

  const handleUnpublish = async (profileId: string) => {
    if (!user) return;
    setActionLoading(true);
    setMessage(null);

    const { success, error } = await reviewTeamProfile(profileId, 'unpublish', user.id);
    setActionLoading(false);

    if (error || !success) {
      setMessage({ type: 'error', text: error?.message || 'Failed to unpublish profile.' });
    } else {
      setMessage({ type: 'success', text: 'Profile unpublished from public directory.' });
      await loadData();
    }
  };

  const openFeedbackModal = (profileId: string) => {
    setSelectedProfileId(profileId);
    setReviewFeedback('');
    setFeedbackModalOpen(true);
  };

  const handleSendFeedback = async () => {
    if (!user || !selectedProfileId) return;
    if (!reviewFeedback.trim()) {
      setMessage({ type: 'error', text: 'Please enter revision instructions for the author.' });
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const { success, error } = await reviewTeamProfile(
      selectedProfileId,
      'request_changes',
      user.id,
      reviewFeedback.trim()
    );

    setActionLoading(false);
    setFeedbackModalOpen(false);

    if (error || !success) {
      setMessage({ type: 'error', text: error?.message || 'Failed to return profile with changes.' });
    } else {
      setMessage({ type: 'success', text: 'Profile returned to author with change requests.' });
      await loadData();
    }
  };

  const handleDelete = async (profileId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete profile for "${name}"? This action is audited.`)) {
      return;
    }

    setActionLoading(true);
    setMessage(null);

    const { success, error } = await deleteTeamProfile(profileId);
    setActionLoading(false);

    if (error || !success) {
      setMessage({ type: 'error', text: error?.message || 'Failed to delete profile.' });
    } else {
      setMessage({ type: 'success', text: 'Profile successfully deleted.' });
      await loadData();
    }
  };

  const handleCreateNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    setMessage(null);

    const { data, error } = await saveTeamProfileDraft(newProfileData, user.id);
    setActionLoading(false);

    if (error || !data) {
      setMessage({ type: 'error', text: error?.message || 'Failed to create new profile.' });
    } else {
      setMessage({ type: 'success', text: 'Profile created successfully in draft status.' });
      setNewProfileModalOpen(false);
      setNewProfileData({
        display_name: '',
        display_name_nepali: '',
        public_title: '',
        team_category: 'teaching',
        short_bio: '',
        bio: '',
        is_public: false,
        review_status: 'draft'
      });
      await loadData();
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (activeTab !== 'all' && p.review_status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.display_name.toLowerCase().includes(q);
      const matchTitle = p.public_title.toLowerCase().includes(q);
      const matchCat = p.team_category.toLowerCase().includes(q);
      return matchName || matchTitle || matchCat;
    }
    return true;
  });

  const pendingCount = profiles.filter((p) => p.review_status === 'pending_review').length;

  return (
    <div style={{ padding: 'clamp(var(--space-4), 3vw, var(--space-8))', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
            Governance & Approvals
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '2px 0 0' }}>
            Faculty & Team Profiles
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            to="/admin/profile"
            className="btn btn-secondary"
            style={{ fontSize: '0.8125rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>My Profile</span>
          </Link>
          <button
            type="button"
            onClick={() => setNewProfileModalOpen(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>New Profile</span>
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          style={{
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === 'all' ? 'var(--color-primary-600)' : 'var(--color-border)'}`,
              backgroundColor: activeTab === 'all' ? 'var(--color-primary-600)' : 'var(--color-surface)',
              color: activeTab === 'all' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pending_review')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === 'pending_review' ? '#f59e0b' : 'var(--color-border)'}`,
              backgroundColor: activeTab === 'pending_review' ? '#f59e0b' : 'var(--color-surface)',
              color: activeTab === 'pending_review' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span style={{ padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: activeTab === 'pending_review' ? '#ffffff' : '#f59e0b', color: activeTab === 'pending_review' ? '#b45309' : '#ffffff', fontSize: '0.6875rem', fontWeight: 800 }}>
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('published')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === 'published' ? '#10b981' : 'var(--color-border)'}`,
              backgroundColor: activeTab === 'published' ? '#10b981' : 'var(--color-surface)',
              color: activeTab === 'published' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('changes_requested')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === 'changes_requested' ? '#ef4444' : 'var(--color-border)'}`,
              backgroundColor: activeTab === 'changes_requested' ? '#ef4444' : 'var(--color-surface)',
              color: activeTab === 'changes_requested' ? '#ffffff' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Changes Requested
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('draft')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === 'draft' ? 'var(--color-text-muted)' : 'var(--color-border)'}`,
              backgroundColor: activeTab === 'draft' ? 'var(--color-surface-hover)' : 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Drafts
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or title..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.8125rem'
            }}
          />
        </div>
      </div>

      {/* Profiles Table / List */}
      <div className="card" style={{ padding: 0, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading team profiles...
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No team profiles match the selected filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Member</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Title & Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Updated</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map((p) => {
                  const isFounder = p.is_featured_founder;

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {/* Name & Avatar */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: isFounder ? 'var(--color-primary-600)' : 'rgba(37, 99, 235, 0.12)',
                              color: isFounder ? '#ffffff' : 'var(--color-primary-600)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              flexShrink: 0
                            }}
                          >
                            {p.display_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                              {p.display_name}
                              {isFounder && (
                                <span style={{ marginLeft: '6px', fontSize: '0.6875rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', fontWeight: 800 }}>
                                  Founder
                                </span>
                              )}
                            </div>
                            {p.display_name_nepali && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                {p.display_name_nepali}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: 'var(--color-text)', fontWeight: 600 }}>{p.public_title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                          {p.team_category.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Review Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor:
                              p.review_status === 'published' ? 'rgba(16, 185, 129, 0.12)' :
                              p.review_status === 'pending_review' ? 'rgba(245, 158, 11, 0.15)' :
                              p.review_status === 'changes_requested' ? 'rgba(239, 68, 68, 0.12)' : 'var(--color-surface-hover)',
                            color:
                              p.review_status === 'published' ? '#10b981' :
                              p.review_status === 'pending_review' ? '#b45309' :
                              p.review_status === 'changes_requested' ? '#ef4444' : 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {p.review_status === 'published' && <CheckCircle2 size={12} />}
                          {p.review_status === 'pending_review' && <Clock size={12} />}
                          {p.review_status === 'changes_requested' && <AlertCircle size={12} />}
                          <span>{p.review_status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                        {new Date(p.updated_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Live Link */}
                          <Link
                            to={`/team/${p.slug}`}
                            target="_blank"
                            title="Preview profile"
                            style={{
                              padding: '6px',
                              borderRadius: 'var(--radius-md)',
                              color: 'var(--color-text-secondary)',
                              textDecoration: 'none'
                            }}
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {/* Approve Action */}
                          {p.review_status !== 'published' && (
                            <button
                              type="button"
                              onClick={() => handleApprove(p.id)}
                              disabled={actionLoading}
                              title="Approve & Publish Live"
                              style={{
                                padding: '5px 10px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {/* Request Changes Action */}
                          {p.review_status === 'pending_review' && (
                            <button
                              type="button"
                              onClick={() => openFeedbackModal(p.id)}
                              disabled={actionLoading}
                              title="Request Changes"
                              style={{
                                padding: '5px 10px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              Feedback
                            </button>
                          )}

                          {/* Unpublish Action */}
                          {p.review_status === 'published' && !isFounder && (
                            <button
                              type="button"
                              onClick={() => handleUnpublish(p.id)}
                              disabled={actionLoading}
                              title="Unpublish"
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: 'var(--color-surface-hover)',
                                color: 'var(--color-text-secondary)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Unpublish
                            </button>
                          )}

                          {/* Delete Action (Super Admin only, not founder) */}
                          {(isSuperAdmin || isOwner) && !isFounder && (
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, p.display_name)}
                              disabled={actionLoading}
                              title="Delete profile"
                              style={{
                                padding: '6px',
                                borderRadius: 'var(--radius-md)',
                                color: '#ef4444',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Changes Feedback Modal */}
      {feedbackModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
                Request Profile Revisions
              </h3>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
              Provide clear editorial instructions explaining what needs adjustment (e.g. bio clarity, title verification, or image dimensions).
            </p>

            <textarea
              required
              rows={4}
              value={reviewFeedback}
              onChange={(e) => setReviewFeedback(e.target.value)}
              placeholder="e.g. Please provide your official institutional degree title and expand upon your robotics teaching subjects..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendFeedback}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
              >
                <span>{actionLoading ? 'Sending...' : 'Send Revision Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Profile Modal */}
      {newProfileModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
                Create New Faculty Profile
              </h3>
              <button
                type="button"
                onClick={() => setNewProfileModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Display Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newProfileData.display_name || ''}
                  onChange={(e) => setNewProfileData({ ...newProfileData, display_name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Display Name (Nepali Devanagari)
                </label>
                <input
                  type="text"
                  value={newProfileData.display_name_nepali || ''}
                  onChange={(e) => setNewProfileData({ ...newProfileData, display_name_nepali: e.target.value })}
                  placeholder="e.g. आरभ शर्मा"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Public Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProfileData.public_title || ''}
                  onChange={(e) => setNewProfileData({ ...newProfileData, public_title: e.target.value })}
                  placeholder="e.g. Lead Abacus Instructor"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newProfileData.team_category || 'teaching'}
                  onChange={(e) => setNewProfileData({ ...newProfileData, team_category: e.target.value as TeamCategory })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  <option value="teaching">Teaching Team</option>
                  <option value="program_leads">Program Leads</option>
                  <option value="leadership">Leadership & Management</option>
                  <option value="operations">Operations & Support</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Short Intro *
                </label>
                <textarea
                  required
                  maxLength={300}
                  rows={2}
                  value={newProfileData.short_bio || ''}
                  onChange={(e) => setNewProfileData({ ...newProfileData, short_bio: e.target.value })}
                  placeholder="Brief introductory summary..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '4px' }}>
                  Full Biography *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newProfileData.bio || ''}
                  onChange={(e) => setNewProfileData({ ...newProfileData, bio: e.target.value })}
                  placeholder="Detailed background and pedagogical accomplishments..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setNewProfileModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
                >
                  <span>{actionLoading ? 'Creating...' : 'Create Draft Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
