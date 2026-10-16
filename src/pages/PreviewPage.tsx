import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import { getDraftOrPublishedPost, updatePostStatus } from '../services/blogService';
import { getDraftOrPublishedCourse } from '../services/courseService';
import {
  getContentVersions,
  restoreContentVersion,
  generatePreviewToken,
  verifyPreviewToken
} from '../services/versionService';
import { BlogPost, Course, ContentVersion } from '../types/database';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  Share2,
  Edit3,
  CheckCircle2,
  Clock,
  History,
  Lock,
  ShieldAlert,
  ArrowLeft,
  Copy,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  User,
  Sparkles,
  RefreshCw,
  Eye
} from 'lucide-react';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type Orientation = 'portrait' | 'landscape';

export const PreviewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isStaff, user, roles } = useAuth();

  const contentType = (searchParams.get('type') || 'blog') as 'blog' | 'course';
  const contentId = searchParams.get('id') || '';
  const token = searchParams.get('token');

  // Device & Display State
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [scale, setScale] = useState<number>(100);

  // Content State
  const [post, setPost] = useState<BlogPost | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Authorization State
  const isAuthorized = useMemo(() => {
    if (isStaff) return true;
    if (token && contentId) {
      return verifyPreviewToken(token, contentType, contentId);
    }
    return false;
  }, [isStaff, token, contentType, contentId]);

  // Version History State
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  // Quick Action Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch Content
  const loadContent = async () => {
    if (!contentId) {
      setErrorMsg('No content identifier provided for preview.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (contentType === 'blog') {
        const found = await getDraftOrPublishedPost(contentId);
        if (found) {
          setPost(found);
          const vList = await getContentVersions('blog_post', found.id);
          setVersions(vList);
        } else {
          setErrorMsg(`Article with ID or slug "${contentId}" was not found.`);
        }
      } else if (contentType === 'course') {
        const found = await getDraftOrPublishedCourse(contentId);
        if (found) {
          setCourse(found);
          const vList = await getContentVersions('course', found.id);
          setVersions(vList);
        } else {
          setErrorMsg(`Course with ID or slug "${contentId}" was not found.`);
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error loading draft content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadContent();
    } else {
      setLoading(false);
    }
  }, [isAuthorized, contentType, contentId]);

  // Share Tokenized Preview URL
  const handleSharePreview = () => {
    if (!contentId) return;
    const shareToken = generatePreviewToken(contentType, contentId, 48); // 48-hour secure preview link
    const previewUrl = `${window.location.origin}/preview?type=${contentType}&id=${contentId}&token=${shareToken}`;
    navigator.clipboard.writeText(previewUrl).then(() => {
      showToast('Secure 48-hour preview link copied to clipboard!');
    }).catch(() => {
      showToast('Link generated: ' + previewUrl);
    });
  };

  // Direct Publish Action
  const handlePublishDirectly = async () => {
    if (!post && !course) return;
    if (!window.confirm('Are you sure you want to approve and publish this draft immediately?')) return;

    setIsPublishing(true);
    try {
      if (contentType === 'blog' && post) {
        const res = await updatePostStatus(post.id, 'published');
        if (res.error) throw res.error;
        setPost({ ...post, status: 'published', published_at: new Date().toISOString() });
        showToast('Article successfully published to live website!');
      }
    } catch (err: unknown) {
      showToast('Publish failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsPublishing(false);
    }
  };

  // Restore Historic Snapshot
  const handleRestoreVersion = async (version: ContentVersion) => {
    if (!window.confirm(`Restore to Version ${version.version_number} from ${new Date(version.created_at).toLocaleString()}? Current changes will be archived.`)) {
      return;
    }

    setRestoringVersionId(version.id);
    const { success, error } = await restoreContentVersion(version);
    setRestoringVersionId(null);

    if (success) {
      showToast(`Restored to Version ${version.version_number}!`);
      setIsHistoryOpen(false);
      await loadContent();
    } else {
      showToast('Restoration failed: ' + (error?.message || 'Unknown error'));
    }
  };

  // Word count & Read time calculation
  const stats = useMemo(() => {
    const text = post?.content || course?.description || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [post, course]);

  // Render Markdown HTML
  const renderedMarkdown = useMemo(() => {
    if (contentType === 'blog' && post?.content) {
      return marked.parse(post.content) as string;
    }
    if (contentType === 'course' && course?.description) {
      return marked.parse(course.description) as string;
    }
    return '';
  }, [contentType, post, course]);

  // UNAUTHORIZED STATE
  if (!isAuthorized && !loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-bg-subtle)'
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--color-error, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}
          >
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            Restricted Draft Preview
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            This content is currently in private draft or editorial review mode. To inspect unpublished drafts, you must be signed in with a MindSparQ Staff account or possess a valid cryptographic preview token.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link
              to={`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} />
              Sign In to View
            </Link>
            <Link to="/" className="btn btn-outline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dimension Calculations
  const getDeviceDimensions = () => {
    if (device === 'desktop') {
      return { width: '100%', maxWidth: '1440px', minHeight: '900px' };
    }
    if (device === 'tablet') {
      return orientation === 'portrait'
        ? { width: '768px', minHeight: '1024px' }
        : { width: '1024px', minHeight: '768px' };
    }
    // Mobile
    return orientation === 'portrait'
      ? { width: '390px', minHeight: '844px' }
      : { width: '844px', minHeight: '390px' };
  };

  const currentDim = getDeviceDimensions();
  const currentTitle = post?.title || course?.title || 'Preview Document';
  const currentStatus = post?.status || course?.status || 'draft';

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0d14',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)'
      }}
    >
      {/* =========================================================================
          TOP CONTROL BAR (DEVICE SWITCHER, METADATA, SHARE, PUBLISH)
      ========================================================================= */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#111827',
          borderBottom: '1px solid #1f2937',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left: Navigation & Document Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => navigate(contentType === 'blog' ? '/admin/blog' : '/admin/courses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              backgroundColor: '#1f2937',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
            title="Return to CMS Editor"
          >
            <ArrowLeft size={15} />
            <span>Editor</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor:
                  currentStatus === 'published'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : currentStatus === 'review'
                    ? 'rgba(168, 85, 247, 0.2)'
                    : 'rgba(245, 158, 11, 0.2)',
                color:
                  currentStatus === 'published'
                    ? '#34d399'
                    : currentStatus === 'review'
                    ? '#c084fc'
                    : '#fbbf24',
                border: `1px solid ${
                  currentStatus === 'published'
                    ? '#059669'
                    : currentStatus === 'review'
                    ? '#7e22ce'
                    : '#d97706'
                }`
              }}
            >
              {currentStatus}
            </span>

            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                maxWidth: '260px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#e2e8f0'
              }}
              title={currentTitle}
            >
              {currentTitle}
            </span>
          </div>

          <div style={{ display: 'none', gap: '12px', color: '#64748b', fontSize: '0.75rem' }} className="preview-meta-desktop">
            <span>{stats.words} words</span>
            <span>•</span>
            <span>{stats.minutes} min read</span>
          </div>
        </div>

        {/* Center: Device Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#030712',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #1f2937'
          }}
        >
          <button
            onClick={() => setDevice('desktop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              backgroundColor: device === 'desktop' ? '#2563eb' : 'transparent',
              color: device === 'desktop' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
            title="Desktop View (1440px wide)"
          >
            <Monitor size={15} />
            <span style={{ display: 'inline-block' }}>Desktop</span>
          </button>

          <button
            onClick={() => setDevice('tablet')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              backgroundColor: device === 'tablet' ? '#2563eb' : 'transparent',
              color: device === 'tablet' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
            title="Tablet View (768px iPad)"
          >
            <Tablet size={15} />
            <span style={{ display: 'inline-block' }}>Tablet</span>
          </button>

          <button
            onClick={() => setDevice('mobile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              backgroundColor: device === 'mobile' ? '#2563eb' : 'transparent',
              color: device === 'mobile' ? '#ffffff' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
            title="Mobile View (390px iPhone)"
          >
            <Smartphone size={15} />
            <span style={{ display: 'inline-block' }}>Mobile</span>
          </button>

          {device !== 'desktop' && (
            <button
              onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
              style={{
                marginLeft: '4px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#1f2937',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center'
              }}
              title={`Switch to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
            >
              <RotateCw size={14} />
            </button>
          )}
        </div>

        {/* Right: Actions (Share, Revisions, Quick Publish) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Zoom Selector */}
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{
              backgroundColor: '#1f2937',
              color: '#e2e8f0',
              border: '1px solid #374151',
              borderRadius: '6px',
              padding: '5px 8px',
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
            title="Display Scale"
          >
            <option value={100}>100%</option>
            <option value={85}>85%</option>
            <option value={75}>75%</option>
            <option value={50}>50%</option>
          </select>

          {/* Share Preview Link */}
          <button
            onClick={handleSharePreview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #374151',
              backgroundColor: '#1f2937',
              color: '#f1f5f9',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
            title="Generate secure 48h share link for peer review"
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>

          {/* Revisions History Drawer */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #374151',
              backgroundColor: '#1f2937',
              color: '#f1f5f9',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500
            }}
            title="View revision snapshot history"
          >
            <History size={14} />
            <span>Revisions ({versions.length})</span>
          </button>

          {/* Quick Publish (Only shown for drafts) */}
          {currentStatus !== 'published' && isStaff && (
            <button
              onClick={handlePublishDirectly}
              disabled={isPublishing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#ffffff',
                cursor: isPublishing ? 'wait' : 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600
              }}
              title="Publish immediately to production"
            >
              <Sparkles size={14} />
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN CANVAS CONTAINER
      ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: device === 'desktop' ? 'flex-start' : 'center',
          padding: device === 'desktop' ? '20px' : '40px 20px',
          overflow: 'auto',
          backgroundColor: '#0a0d14',
          backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading draft document snapshot...</p>
          </div>
        ) : errorMsg ? (
          <div
            style={{
              maxWidth: '480px',
              backgroundColor: '#1f2937',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <ShieldAlert size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px' }}>Draft Unavailable</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px' }}>{errorMsg}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: '#374151',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        ) : (
          /* =========================================================================
             SIMULATED DEVICE FRAME
          ========================================================================= */
          <div
            style={{
              width: currentDim.width,
              maxWidth: currentDim.maxWidth,
              minHeight: currentDim.minHeight,
              transform: scale !== 100 ? `scale(${scale / 100})` : undefined,
              transformOrigin: 'top center',
              transition: 'width 0.3s ease, min-height 0.3s ease, transform 0.2s ease',
              backgroundColor: 'var(--color-bg, #ffffff)',
              color: 'var(--color-text-primary, #0f172a)',
              borderRadius: device === 'desktop' ? '10px' : device === 'tablet' ? '28px' : '38px',
              boxShadow:
                device === 'desktop'
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px #1f2937'
                  : '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 12px #1e293b, 0 0 0 14px #0f172a',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Desktop Browser Header Bar */}
            {device === 'desktop' && (
              <div
                style={{
                  height: '42px',
                  backgroundColor: '#f1f5f9',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  gap: '12px',
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}
              >
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                </div>
                <div
                  style={{
                    flex: 1,
                    maxWidth: '600px',
                    margin: '0 auto',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: '#334155'
                  }}
                >
                  <Lock size={12} color="#10b981" />
                  <span>https://mindsparqeducation.com.np/{contentType}/{post?.slug || course?.slug || 'preview'}</span>
                  <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 600, fontSize: '0.6875rem' }}>
                    [DRAFT PREVIEW]
                  </span>
                </div>
              </div>
            )}

            {/* Mobile / Tablet Dynamic Island & Status Bar */}
            {device === 'mobile' && orientation === 'portrait' && (
              <div
                style={{
                  height: '44px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 24px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  position: 'relative',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <span>9:41</span>
                {/* Simulated Dynamic Island Pill */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '8px',
                    transform: 'translateX(-50%)',
                    width: '96px',
                    height: '24px',
                    backgroundColor: '#000000',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0f172a', marginLeft: 'auto', marginRight: '8px' }} />
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6875rem' }}>5G</span>
                  <div style={{ width: '18px', height: '10px', border: '1px solid #0f172a', borderRadius: '2px', padding: '1px' }}>
                    <div style={{ width: '80%', height: '100%', backgroundColor: '#0f172a' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Simulated Watermark Strip */}
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                color: '#b45309',
                padding: '6px 16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Eye size={14} />
              <span>CONFIDENTIAL DRAFT PREVIEW — PRIVATE STAGING VIEW ONLY</span>
            </div>

            {/* =========================================================================
                RENDERED PREVIEW CONTENT (BLOG OR COURSE)
            ========================================================================= */}
            <div style={{ flex: 1, padding: device === 'mobile' ? '16px' : '40px', overflowY: 'auto' }}>
              {contentType === 'blog' && post && (
                <article style={{ maxWidth: '820px', margin: '0 auto' }}>
                  {/* Category & Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary-50, #eff6ff)',
                        color: 'var(--color-primary-700, #1d4ed8)',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      {post.category || 'Education'}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary, #64748b)', fontSize: '0.8125rem' }}>
                      {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Unpublished Draft'}
                    </span>
                  </div>

                  {/* Title */}
                  <h1
                    style={{
                      fontSize: device === 'mobile' ? '1.75rem' : '2.5rem',
                      fontWeight: 800,
                      lineHeight: 1.25,
                      marginBottom: '16px',
                      color: 'var(--color-text-primary, #0f172a)'
                    }}
                  >
                    {post.title}
                  </h1>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p
                      style={{
                        fontSize: device === 'mobile' ? '1rem' : '1.1875rem',
                        lineHeight: 1.6,
                        color: 'var(--color-text-secondary, #475569)',
                        marginBottom: '24px',
                        fontStyle: 'italic',
                        borderLeft: '4px solid var(--color-primary-500, #3b82f6)',
                        paddingLeft: '16px'
                      }}
                    >
                      {post.excerpt}
                    </p>
                  )}

                  {/* Author Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 0',
                      borderTop: '1px solid var(--color-border, #e2e8f0)',
                      borderBottom: '1px solid var(--color-border, #e2e8f0)',
                      marginBottom: '32px'
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-100, #dbeafe)',
                        color: 'var(--color-primary-700, #1d4ed8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}
                    >
                      {post.author_name ? post.author_name[0] : 'M'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text-primary, #0f172a)' }}>
                        {post.author_name || 'MindSparQ Faculty'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary, #64748b)' }}>
                        {stats.words} words • {stats.minutes} min read
                      </div>
                    </div>
                  </div>

                  {/* Cover Image */}
                  {post.cover_image_url && (
                    <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        style={{ width: '100%', maxHeight: '440px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Markdown Body */}
                  <div
                    className="article-content"
                    style={{
                      fontSize: device === 'mobile' ? '1rem' : '1.0625rem',
                      lineHeight: 1.8,
                      color: 'var(--color-text-primary, #1e293b)'
                    }}
                    dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                  />
                </article>
              )}

              {contentType === 'course' && course && (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <span
                      style={{
                        backgroundColor: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                    >
                      {course.level}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {course.estimated_duration || 'Self-paced'}
                    </span>
                  </div>

                  <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '16px' }}>
                    {course.title}
                  </h1>

                  <p style={{ fontSize: '1.125rem', color: '#475569', marginBottom: '28px', lineHeight: 1.6 }}>
                    {course.summary}
                  </p>

                  {course.cover_image_url && (
                    <div style={{ marginBottom: '32px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img
                        src={course.cover_image_url}
                        alt={course.title}
                        style={{ width: '100%', maxHeight: '380px', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div
                    className="course-description"
                    style={{ lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
                  />
                </div>
              )}
            </div>

            {/* Mobile Home Bar */}
            {device === 'mobile' && orientation === 'portrait' && (
              <div
                style={{
                  height: '24px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '6px'
                }}
              >
                <div style={{ width: '120px', height: '4px', backgroundColor: '#0f172a', borderRadius: '2px' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          REVISION HISTORY DRAWER
      ========================================================================= */}
      {isHistoryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.15s ease'
          }}
          onClick={() => setIsHistoryOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: '#111827',
              borderLeft: '1px solid #1f2937',
              height: '100%',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="#38bdf8" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                  Version Snapshots
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '20px' }}>
              Every time this document is modified or saved, an immutable snapshot is recorded. You can inspect previous versions and restore them with a single click.
            </p>

            {versions.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  backgroundColor: '#030712',
                  borderRadius: '8px',
                  border: '1px solid #1f2937',
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}
              >
                No historical revisions recorded yet for this document.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {versions.map((ver, idx) => (
                  <div
                    key={ver.id}
                    style={{
                      backgroundColor: idx === 0 ? '#1e293b' : '#030712',
                      border: `1px solid ${idx === 0 ? '#38bdf8' : '#1f2937'}`,
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: idx === 0 ? 'rgba(56, 189, 248, 0.2)' : '#1f2937',
                          color: idx === 0 ? '#38bdf8' : '#94a3b8'
                        }}
                      >
                        v{ver.version_number} {idx === 0 && '• Latest'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(ver.created_at).toLocaleDateString()} {new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {ver.change_summary || ver.title}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={12} />
                      <span>{ver.created_by_name || 'Staff Editor'}</span>
                    </div>

                    {idx !== 0 && (
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        disabled={restoringVersionId === ver.id}
                        style={{
                          marginTop: '6px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#374151',
                          color: '#f8fafc',
                          border: 'none',
                          cursor: restoringVersionId === ver.id ? 'wait' : 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={12} className={restoringVersionId === ver.id ? 'animate-spin' : ''} />
                        <span>Restore this Snapshot</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPage;
