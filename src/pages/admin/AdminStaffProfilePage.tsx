import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Save, 
  Send, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  X
} from 'lucide-react';
import { SocialIcon } from '../../components/ui/SocialIcon';
import { useAuth } from '../../context/AuthContext';
import { getMyTeamProfile, saveTeamProfileDraft, submitProfileForReview } from '../../services/teamService';
import { TeamProfile, TeamCategory, TeamSocialLinks } from '../../types/database';

export const AdminStaffProfilePage: React.FC = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Partial<TeamProfile>>({
    display_name: authProfile?.display_name || '',
    display_name_nepali: '',
    public_title: '',
    public_title_nepali: '',
    team_category: 'teaching',
    short_bio: '',
    bio: '',
    education: '',
    qualifications: [],
    teaching_subjects: [],
    responsibilities: [],
    social_links: {},
    review_status: 'draft',
    is_public: false
  });

  const [newQualification, setNewQualification] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    getMyTeamProfile(user.id)
      .then((existing) => {
        if (!isMounted) return;
        if (existing) {
          setProfile(existing);
        } else {
          setProfile((prev) => ({
            ...prev,
            display_name: authProfile?.display_name || user.email?.split('@')[0] || '',
            user_id: user.id
          }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[MindSparQ Team] Failed to load staff profile:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, authProfile]);

  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    // Validate URLs
    const social = profile.social_links || {};
    for (const [key, val] of Object.entries(social)) {
      if (val && !val.startsWith('https://') && !val.startsWith('http://')) {
        setSaving(false);
        setMessage({ type: 'error', text: `Social URL for ${key} must start with https://` });
        return;
      }
    }

    const { data, error } = await saveTeamProfileDraft(profile, user.id);
    setSaving(false);

    if (error || !data) {
      setMessage({ type: 'error', text: error?.message || 'Failed to persist draft profile.' });
    } else {
      setProfile(data);
      setMessage({ type: 'success', text: 'Draft profile saved successfully!' });
    }
  };

  const handleSubmitReview = async () => {
    if (!profile.id) {
      setMessage({ type: 'error', text: 'Please save draft before submitting for review.' });
      return;
    }

    if (!profile.display_name?.trim() || !profile.public_title?.trim() || !profile.short_bio?.trim()) {
      setMessage({ type: 'error', text: 'Display Name, Public Title, and Short Bio are required before submission.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { success, error } = await submitProfileForReview(profile.id);
    setSubmitting(false);

    if (error || !success) {
      setMessage({ type: 'error', text: error?.message || 'Failed to submit profile for review.' });
    } else {
      setProfile((prev) => ({ ...prev, review_status: 'pending_review' }));
      setMessage({ type: 'success', text: 'Profile successfully submitted for Super Admin review!' });
    }
  };

  const addTag = (
    field: 'qualifications' | 'teaching_subjects' | 'responsibilities',
    value: string,
    setter: (s: string) => void
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const current = profile[field] || [];
    if (!current.includes(trimmed)) {
      setProfile({ ...profile, [field]: [...current, trimmed] });
    }
    setter('');
  };

  const removeTag = (
    field: 'qualifications' | 'teaching_subjects' | 'responsibilities',
    index: number
  ) => {
    const current = profile[field] || [];
    setProfile({
      ...profile,
      [field]: current.filter((_, i) => i !== index)
    });
  };

  const handleSocialChange = (key: keyof TeamSocialLinks, value: string) => {
    setProfile({
      ...profile,
      social_links: {
        ...profile.social_links,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading staff profile...</p>
      </div>
    );
  }

  const reviewStatus = profile.review_status || 'draft';

  return (
    <div style={{ padding: 'clamp(var(--space-4), 3vw, var(--space-8))', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Page Title & Status Banner */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
              Staff Workspace
            </div>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '2px 0 0' }}>
              My Faculty Profile
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {profile.slug && profile.review_status === 'published' && (
              <Link
                to={`/team/${profile.slug}`}
                target="_blank"
                className="btn btn-secondary"
                style={{ fontSize: '0.8125rem', padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>View Live Profile</span>
                <ExternalLink size={14} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => handleSaveDraft()}
              disabled={saving}
              className="btn btn-secondary"
              style={{ fontSize: '0.8125rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submitting || reviewStatus === 'pending_review'}
              className="btn btn-primary"
              style={{ fontSize: '0.8125rem', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Send size={15} />
              <span>{submitting ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </div>
        </div>

        {/* Status Pill Alert */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 
              reviewStatus === 'published' ? 'rgba(16, 185, 129, 0.1)' :
              reviewStatus === 'pending_review' ? 'rgba(245, 158, 11, 0.1)' :
              reviewStatus === 'changes_requested' ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-surface-hover)',
            border: `1px solid ${
              reviewStatus === 'published' ? 'rgba(16, 185, 129, 0.3)' :
              reviewStatus === 'pending_review' ? 'rgba(245, 158, 11, 0.3)' :
              reviewStatus === 'changes_requested' ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {reviewStatus === 'published' && <CheckCircle2 size={18} style={{ color: '#10b981' }} />}
            {reviewStatus === 'pending_review' && <Clock size={18} style={{ color: '#f59e0b' }} />}
            {reviewStatus === 'changes_requested' && <AlertCircle size={18} style={{ color: '#ef4444' }} />}
            {reviewStatus === 'draft' && <UserCheck size={18} style={{ color: 'var(--color-text-secondary)' }} />}

            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Governance Status: {reviewStatus.replace('_', ' ').toUpperCase()}
              </span>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {reviewStatus === 'published' && 'Your profile is approved and live on the public directory.'}
                {reviewStatus === 'pending_review' && 'Your profile draft has been submitted and is currently being reviewed by Super Admin.'}
                {reviewStatus === 'changes_requested' && (profile.review_notes || 'The administrator requested changes to your profile submission.')}
                {reviewStatus === 'draft' && 'You can edit your details freely. Click "Submit for Review" once ready for publication.'}
                {reviewStatus === 'unpublished' && 'Your profile is currently unpublished by administration.'}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Message */}
        {message && (
          <div
            style={{
              marginTop: 'var(--space-4)',
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
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSaveDraft} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Section 1: Basic Information */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            1. Basic Profile Identity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Full Display Name (English) *
              </label>
              <input
                type="text"
                required
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="e.g. Samay Budhathoki Chhetri"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Display Name (Nepali Devanagari)
              </label>
              <input
                type="text"
                value={profile.display_name_nepali || ''}
                onChange={(e) => setProfile({ ...profile, display_name_nepali: e.target.value })}
                placeholder="e.g. समय बुढाथोकी क्षेत्री"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Public Designation / Title *
              </label>
              <input
                type="text"
                required
                value={profile.public_title || ''}
                onChange={(e) => setProfile({ ...profile, public_title: e.target.value })}
                placeholder="e.g. Senior Robotics Instructor"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                Faculty Category
              </label>
              <select
                value={profile.team_category || 'teaching'}
                onChange={(e) => setProfile({ ...profile, team_category: e.target.value as TeamCategory })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              >
                <option value="teaching">Teaching Team / Faculty</option>
                <option value="program_leads">Program Lead / Coordinator</option>
                <option value="leadership">Leadership & Management</option>
                <option value="operations">Operations & School Support</option>
                <option value="advisory">Advisory & Research</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                Short Professional Intro (max 300 characters) *
              </label>
              <span style={{ fontSize: '0.75rem', color: (profile.short_bio?.length || 0) > 300 ? '#ef4444' : 'var(--color-text-muted)' }}>
                {profile.short_bio?.length || 0} / 300
              </span>
            </div>
            <textarea
              required
              maxLength={300}
              rows={2}
              value={profile.short_bio || ''}
              onChange={(e) => setProfile({ ...profile, short_bio: e.target.value })}
              placeholder="A brief summary shown on cards and preview lists..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
              Detailed "About" Biography *
            </label>
            <textarea
              required
              rows={6}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Comprehensive professional biography detailing pedagogical philosophies, background, and teaching experience..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Section 2: Structured Professional Credentials */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            2. Professional Credentials & Disciplines
          </h2>

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
              Education & Academic Background
            </label>
            <input
              type="text"
              value={profile.education || ''}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              placeholder="e.g. Master of Computer Applications (MCA) / B.Sc. Physics"
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Qualifications Array */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
              Certifications & Qualifications
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('qualifications', newQualification, setNewQualification);
                  }
                }}
                placeholder="e.g. Certified Abacus Master Trainer"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
              <button
                type="button"
                onClick={() => addTag('qualifications', newQualification, setNewQualification)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(profile.qualifications || []).map((q, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: 'var(--color-primary-600)',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  <span>{q}</span>
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag('qualifications', idx)} />
                </span>
              ))}
            </div>
          </div>

          {/* Teaching Subjects Array */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
              Teaching Subjects & Modules
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('teaching_subjects', newSubject, setNewSubject);
                  }
                }}
                placeholder="e.g. Python for Robotics / Vedic Math"
                style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
              <button
                type="button"
                onClick={() => addTag('teaching_subjects', newSubject, setNewSubject)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.8125rem' }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(profile.teaching_subjects || []).map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                >
                  <span>{s}</span>
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag('teaching_subjects', idx)} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Verified Social Channels */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
            3. Verified Professional Social Links
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            All URLs must start with <code>https://</code>. Approved links will be displayed on your profile and bylines.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                <SocialIcon platform="linkedin" size={14} style={{ color: '#0a66c2' }} /> LinkedIn
              </label>
              <input
                type="url"
                value={profile.social_links?.linkedin || ''}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                <SocialIcon platform="facebook" size={14} style={{ color: '#1877f2' }} /> Facebook
              </label>
              <input
                type="url"
                value={profile.social_links?.facebook || ''}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/username"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                <SocialIcon platform="instagram" size={14} style={{ color: '#e1306c' }} /> Instagram
              </label>
              <input
                type="url"
                value={profile.social_links?.instagram || ''}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                <SocialIcon platform="youtube" size={14} style={{ color: '#ff0000' }} /> YouTube Channel
              </label>
              <input
                type="url"
                value={profile.social_links?.youtube || ''}
                onChange={(e) => handleSocialChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@channel"
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '0.875rem' }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingBottom: 'var(--space-8)' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={submitting || reviewStatus === 'pending_review'}
            className="btn btn-primary"
            style={{ padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={16} />
            <span>{submitting ? 'Submitting...' : 'Submit Profile for Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
