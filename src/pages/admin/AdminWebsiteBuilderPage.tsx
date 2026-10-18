import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getPageContent,
  savePageDraft,
  publishPage,
  restorePageVersion,
  validateUrlScheme,
  sanitizeContentText,
  PageContentData,
  PageSectionItem,
  DEFAULT_PAGES_REGISTRY
} from '../../services/pageService';
import {
  getSiteThemeSettings,
  MindSparQThemeSettings
} from '../../services/siteThemeService';
import {
  getContentVersions
} from '../../services/versionService';
import { ContentVersion } from '../../types/database';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  RotateCcw,
  History,
  Sparkles,
  X,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AccessibleHint } from '../../components/ui/AccessibleHint';
import { useStyleOverrides } from '../../hooks/useStyleOverrides';
import { StyleInspector } from '../../components/admin/StyleInspector';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type InspectorTab = 'content' | 'layout' | 'style' | 'seo';

export const AdminWebsiteBuilderPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile, user } = useAuth();

  const {
    overrides,
    updateElementOverride,
    resetElementOverride,
    saveDraft: saveStyleDraft,
    publishLive: publishStyleLive
  } = useStyleOverrides({ mode: 'draft' });

  // Active page selector
  const initialPageSlug = searchParams.get('page') || 'about';
  const [activeSlug, setActiveSlug] = useState<string>(initialPageSlug);
  const [pageData, setPageData] = useState<PageContentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Inspector and selection state
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Persistence and status feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers
  const [showAddSectionModal, setShowAddSectionModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState<boolean>(false);

  // Active theme settings for header/footer in live canvas
  const [themeSettings] = useState<MindSparQThemeSettings>(() => getSiteThemeSettings());

  const authorDisplayName = profile?.display_name || user?.email || 'Staff Editor';

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Load page content whenever activeSlug changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSaveStatus('idle');
    setHasUnsavedChanges(false);

    getPageContent(activeSlug, 'draft').then((data) => {
      if (!isMounted) return;
      setPageData(data);
      if (data.sections && data.sections.length > 0) {
        setSelectedSectionId(data.sections[0].id);
      } else {
        setSelectedSectionId(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  // Sync search param with page selection
  const handleSelectPage = (slug: string) => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes in this draft. Switch pages anyway?')) {
        return;
      }
    }
    setActiveSlug(slug);
    setSearchParams({ page: slug });
  };

  // Selected Section Helper
  const selectedSection = useMemo(() => {
    if (!pageData || !selectedSectionId) return null;
    return pageData.sections.find((s) => s.id === selectedSectionId) || null;
  }, [pageData, selectedSectionId]);

  // Mutation Helper
  const updatePage = (partial: Partial<PageContentData>) => {
    if (!pageData) return;
    setPageData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...partial
      };
    });
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  };

  const updateSection = (sectionId: string, partial: Partial<PageSectionItem>) => {
    if (!pageData) return;
    const updatedSections = pageData.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, ...partial };
      }
      return sec;
    });
    updatePage({ sections: updatedSections });
  };

  // Section Ordering & Structural Actions
  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!pageData) return;
    const index = pageData.sections.findIndex((s) => s.id === sectionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pageData.sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSections = [...pageData.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    // Re-index sortOrder
    const reindexed = newSections.map((sec, idx) => ({ ...sec, sortOrder: idx + 1 }));
    updatePage({ sections: reindexed });
  };

  const handleToggleSectionVisibility = (sectionId: string) => {
    if (!pageData) return;
    const updatedSections = pageData.sections.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, isVisible: !sec.isVisible };
      }
      return sec;
    });
    updatePage({ sections: updatedSections });
  };

  const handleDuplicateSection = (sectionId: string) => {
    if (!pageData) return;
    const target = pageData.sections.find((s) => s.id === sectionId);
    if (!target) return;

    const duplicated: PageSectionItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copy)`,
      sortOrder: pageData.sections.length + 1
    };

    updatePage({ sections: [...pageData.sections, duplicated] });
    setSelectedSectionId(duplicated.id);
    showNotice('success', `Duplicated section: "${duplicated.title}"`);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!pageData) return;
    const target = pageData.sections.find((s) => s.id === sectionId);
    if (!window.confirm(`Are you sure you want to remove section "${target?.title || 'Section'}"?`)) return;

    const filtered = pageData.sections.filter((s) => s.id !== sectionId);
    updatePage({ sections: filtered });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(filtered.length > 0 ? filtered[0].id : null);
    }
    showNotice('success', 'Section removed from draft.');
  };

  // Add Section Template Library
  const handleAddSectionTemplate = (templateType: PageSectionItem['type']) => {
    if (!pageData) return;

    const newId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let newSection: PageSectionItem;

    switch (templateType) {
      case 'hero':
        newSection = {
          id: newId,
          type: 'hero',
          title: 'Engaging Headline That Inspires Learners',
          subtitle: 'Clear, concise sub-headline detailing the unique pedagogical value proposition.',
          badge: 'Featured Program',
          content: 'Introductory explanation of the curriculum or milestone.',
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'MindSparQ Learning Demonstration',
          ctaText: 'Get Started Today',
          ctaUrl: '/contact',
          ctaTarget: '_self',
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
      case 'split_media':
        newSection = {
          id: newId,
          type: 'split_media',
          title: 'Experiential Hands-on Discovery',
          subtitle: 'Moving beyond passive rote memorization toward interactive engineering.',
          badge: 'Our Pedagogy',
          content: 'Students assemble real hardware circuits, program sensors, and solve computational challenges in collaborative groups.',
          imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
          imageAlt: 'Students working on robotics project',
          ctaText: 'View Course Modules',
          ctaUrl: '/courses',
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
      case 'feature_grid':
        newSection = {
          id: newId,
          type: 'feature_grid',
          title: 'Core Educational Pillars',
          subtitle: 'Empowering children with holistic cognitive and computational tools.',
          badge: 'Curriculum Highlights',
          content: 'Designed by certified instructors for progressive development.',
          items: [
            { id: 'item-1', title: 'Mental Math & Abacus', description: 'Bilateral brain stimulation enhancing working memory and arithmetic speed.', icon: 'Calculator' },
            { id: 'item-2', title: 'Coding & Logic Sequencing', description: 'Translating human concepts into algorithms, Scratch logic, and Python commands.', icon: 'Cpu' },
            { id: 'item-3', title: 'Robotics & Hardware Labs', description: 'Hands-on sensor experiments, microcontrollers, and motor physics.', icon: 'Layers' }
          ],
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
      case 'faq':
        newSection = {
          id: newId,
          type: 'faq',
          title: 'Frequently Asked Questions',
          subtitle: 'Everything parents and educators need to know about enrollments.',
          badge: 'Admissions FAQ',
          content: 'Have questions not answered below? Reach out to our center directly.',
          items: [
            { id: 'faq-1', title: 'What is the recommended age group?', description: 'Our foundational programs cater to ages 5 through 16, separated into elementary, middle, and high school tiers.' },
            { id: 'faq-2', title: 'Do students need prior coding experience?', description: 'No prior background is required. Beginners start with intuitive visual block languages before transitioning to syntax.' }
          ],
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
      case 'cta':
        newSection = {
          id: newId,
          type: 'cta',
          title: 'Ready to Spark Your Child’s Potential?',
          subtitle: 'Visit our flagship center in Butwal 11 or request a free consultation session with our academic mentors.',
          badge: 'Next Step',
          content: 'Book an experiential demonstration class today.',
          ctaText: 'Book a Free Consultation',
          ctaUrl: '/contact',
          ctaTarget: '_self',
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
      case 'rich_text':
      default:
        newSection = {
          id: newId,
          type: 'rich_text',
          title: 'Institutional Overview & Background',
          badge: 'Academic Notice',
          content: '### Section Overview\nEnter clear, informative markdown or rich text detailing your educational initiatives, research milestones, or curriculum outlines here.',
          isVisible: true,
          sortOrder: pageData.sections.length + 1
        };
        break;
    }

    updatePage({ sections: [...pageData.sections, newSection] });
    setSelectedSectionId(newSection.id);
    setShowAddSectionModal(false);
    showNotice('success', `Added new section: "${newSection.title}"`);
  };

  // Draft Saving
  const handleSaveDraft = async () => {
    if (!pageData) return;
    setSaveStatus('saving');

    const res = await savePageDraft(activeSlug, pageData, authorDisplayName);
    await saveStyleDraft(authorDisplayName);

    if (res.success && res.data) {
      setPageData(res.data);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      showNotice('success', 'Draft and visual styling saved successfully. Live public site is untouched.');
    } else {
      setSaveStatus('failed');
      showNotice('error', res.error?.message || 'Failed to save draft.');
    }
  };

  // Live Publishing
  const handlePublishLive = async () => {
    if (!pageData) return;
    setSaveStatus('saving');

    const res = await publishPage(activeSlug, authorDisplayName);
    await publishStyleLive(authorDisplayName, `Published ${activeSlug} styling updates`);

    if (res.success && res.data) {
      setPageData(res.data);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setShowPublishModal(false);
      showNotice('success', `Page "${pageData.title}" and visual styles successfully published to live website!`);
    } else {
      setSaveStatus('failed');
      showNotice('error', res.error?.message || 'Publishing failed.');
    }
  };

  // Open Version History
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setVersionsLoading(true);
    const list = await getContentVersions('page', activeSlug);
    setVersions(list);
    setVersionsLoading(false);
  };

  // Restore Historic Version
  const handleRestoreVersion = async (ver: ContentVersion) => {
    if (!window.confirm(`Restore version #${ver.version_number} ("${ver.title}") into draft?`)) return;

    const res = await restorePageVersion(activeSlug, ver.snapshot, authorDisplayName);
    if (res.success) {
      const refreshed = await getPageContent(activeSlug, 'draft');
      setPageData(refreshed);
      setHasUnsavedChanges(true);
      setShowHistoryModal(false);
      showNotice('success', `Version #${ver.version_number} restored into draft. Review and publish when ready.`);
    } else {
      showNotice('error', res.error?.message || 'Failed to restore version.');
    }
  };

  // Reset to Default Institutional Template
  const handleResetToDefaults = () => {
    const defaultTemplate = DEFAULT_PAGES_REGISTRY[activeSlug];
    if (!defaultTemplate) return;

    if (!window.confirm(`Reset "${defaultTemplate.name}" to verified institutional defaults? Unsaved draft edits will be lost.`)) return;

    updatePage({
      title: defaultTemplate.title,
      subtitle: defaultTemplate.subtitle,
      heroImageUrl: defaultTemplate.heroImageUrl,
      seo: { ...defaultTemplate.seo },
      sections: JSON.parse(JSON.stringify(defaultTemplate.sections))
    });

    showNotice('success', 'Reset page to default verified institutional layout.');
  };

  // Global Keyboard Shortcuts (Ctrl+S for Draft, Alt+P for Publish, Alt+1/2/3 for devices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
        return;
      }

      if ((e.altKey && (e.key === 'p' || e.key === 'P')) || (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p'))) {
        e.preventDefault();
        setShowPublishModal(true);
        return;
      }

      if (!isInput && e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setDeviceMode('desktop');
        } else if (e.key === '2') {
          e.preventDefault();
          setDeviceMode('tablet');
        } else if (e.key === '3') {
          e.preventDefault();
          setDeviceMode('mobile');
        } else if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleOpenHistory();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageData, activeSlug, authorDisplayName]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading Website Builder workspace...</p>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: '#ef4444', margin: '0 auto 12px' }} />
        <h3>Unable to load page content</h3>
        <p style={{ color: 'var(--color-text-secondary)' }}>Please select a valid page from the registry.</p>
        <button type="button" onClick={() => handleSelectPage('about')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Load About Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
      {/* ==================================================================== */}
      {/* 1. TOP BUILDER WORKSPACE TOOLBAR                                      */}
      {/* ==================================================================== */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          zIndex: 100,
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Page Selector & Route info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} style={{ color: 'var(--color-primary-600)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
              Page Editor:
            </span>
          </div>

          <select
            value={activeSlug}
            onChange={(e) => handleSelectPage(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {Object.values(DEFAULT_PAGES_REGISTRY).map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} ({p.route})
              </option>
            ))}
          </select>

          <span
            style={{
              fontSize: '0.75rem',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: pageData.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: pageData.status === 'published' ? '#16a34a' : '#ca8a04',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {pageData.status === 'published' ? '● Published' : '○ Draft Mode'}
          </span>

          {hasUnsavedChanges && (
            <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600 }}>
              * Unsaved changes
            </span>
          )}
        </div>

        {/* Center: Device Breakpoint Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: '8px',
            padding: '3px',
            gap: '2px',
            border: '1px solid var(--color-border)'
          }}
        >
          <AccessibleHint text="Desktop responsive preview (1200px)" shortcut="Alt+1">
            <button
              type="button"
              onClick={() => setDeviceMode('desktop')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: deviceMode === 'desktop' ? 'var(--color-surface)' : 'transparent',
                color: deviceMode === 'desktop' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: deviceMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Monitor size={14} /> Desktop
            </button>
          </AccessibleHint>

          <AccessibleHint text="Tablet portrait preview (768px)" shortcut="Alt+2">
            <button
              type="button"
              onClick={() => setDeviceMode('tablet')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: deviceMode === 'tablet' ? 'var(--color-surface)' : 'transparent',
                color: deviceMode === 'tablet' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: deviceMode === 'tablet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Tablet size={14} /> Tablet
            </button>
          </AccessibleHint>

          <AccessibleHint text="Mobile device preview (375px)" shortcut="Alt+3">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: deviceMode === 'mobile' ? 'var(--color-surface)' : 'transparent',
                color: deviceMode === 'mobile' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                boxShadow: deviceMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </AccessibleHint>
        </div>

        {/* Right: Actions (Save Draft, History, Publish) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AccessibleHint text="Inspect revision history and rollback snapshots" shortcut="Alt+H">
            <button
              type="button"
              onClick={handleOpenHistory}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <History size={14} /> Revisions
            </button>
          </AccessibleHint>

          <AccessibleHint text="Save working draft to cloud & cache without affecting live site" shortcut="Ctrl+S">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saveStatus === 'saving'}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={14} />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
            </button>
          </AccessibleHint>

          <AccessibleHint text="Publish current draft live to all site visitors instantly" shortcut="Alt+P">
            <button
              type="button"
              onClick={() => setShowPublishModal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Sparkles size={14} /> Publish Live
            </button>
          </AccessibleHint>
        </div>
      </header>

      {/* Status Notice Toast */}
      {notification && (
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: notification.type === 'success' ? '#15803d' : '#b91c1c',
            color: '#ffffff',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. MAIN THREE-PANE WORKSPACE: OUTLINE | CANVAS | INSPECTOR            */}
      {/* ==================================================================== */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* ------------------------------------------------------------------ */}
        {/* LEFT PANE: SECTION OUTLINE TREE                                    */}
        {/* ------------------------------------------------------------------ */}
        <aside
          style={{
            width: '280px',
            borderRight: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: 'var(--color-primary-600)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                Page Sections ({pageData.sections.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSectionModal(true)}
              className="btn btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={12} /> Add
            </button>
          </div>

          {/* Section List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {pageData.sections.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                <p>No custom sections yet.</p>
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(true)}
                  className="btn btn-primary"
                  style={{ marginTop: '8px', fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  <Plus size={12} /> Add First Section
                </button>
              </div>
            ) : (
              pageData.sections.map((sec, idx) => {
                const isSelected = sec.id === selectedSectionId;
                return (
                  <div
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    style={{
                      padding: '10px 12px',
                      marginBottom: '6px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'var(--color-bg)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-600)' : 'var(--color-text-secondary)' }}>
                        #{idx + 1} • {sec.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(sec.id, 'up');
                          }}
                          disabled={idx === 0}
                          style={{ background: 'transparent', border: 'none', padding: '2px', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? 0.3 : 0.8 }}
                          title="Move up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveSection(sec.id, 'down');
                          }}
                          disabled={idx === pageData.sections.length - 1}
                          style={{ background: 'transparent', border: 'none', padding: '2px', cursor: idx === pageData.sections.length - 1 ? 'default' : 'pointer', opacity: idx === pageData.sections.length - 1 ? 0.3 : 0.8 }}
                          title="Move down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSectionVisibility(sec.id);
                          }}
                          style={{ background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer', color: sec.isVisible ? '#16a34a' : '#9ca3af' }}
                          title={sec.isVisible ? 'Visible on page' : 'Hidden from page'}
                        >
                          {sec.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sec.title}
                    </div>

                    {sec.badge && (
                      <span style={{ fontSize: '0.6875rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'inline-block' }}>
                        {sec.badge}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick template reset */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.75rem', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RotateCcw size={12} /> Reset to Verified Defaults
            </button>
          </div>
        </aside>

        {/* ------------------------------------------------------------------ */}
        {/* CENTER PANE: LIVE RESPONSIVE CANVAS & PREVIEW                      */}
        {/* ------------------------------------------------------------------ */}
        <main
          style={{
            flex: 1,
            backgroundColor: '#0a0f1d',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflowY: 'auto',
            padding: '24px 16px'
          }}
        >
          {/* Viewport Frame Container */}
          <div
            style={{
              width: deviceMode === 'mobile' ? '375px' : deviceMode === 'tablet' ? '768px' : '100%',
              maxWidth: deviceMode === 'desktop' ? '1200px' : undefined,
              minHeight: '800px',
              backgroundColor: 'var(--color-bg)',
              borderRadius: deviceMode === 'desktop' ? '8px' : '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all var(--transition-normal)'
            }}
          >
            {/* Live Header Simulation */}
            <div
              style={{
                height: `${themeSettings.header.height || 68}px`,
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  MindSparQ
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                <span>Home</span>
                <span style={{ color: 'var(--color-primary-600)', fontWeight: 700 }}>{pageData.name}</span>
                <span>Programs</span>
                <span>Contact</span>
              </div>
            </div>

            {/* Page Hero Banner */}
            <div
              style={{
                padding: '48px 24px',
                backgroundColor: 'var(--color-surface-hover)',
                borderBottom: '1px solid var(--color-border)',
                textAlign: 'center',
                backgroundImage: pageData.heroImageUrl ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${pageData.heroImageUrl})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: pageData.heroImageUrl ? '#ffffff' : 'inherit'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: pageData.heroImageUrl ? '#93c5fd' : 'var(--color-primary-600)', letterSpacing: '0.05em' }}>
                {pageData.name}
              </span>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0', lineHeight: 1.2 }}>
                {pageData.title}
              </h1>
              {pageData.subtitle && (
                <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '0.9375rem', opacity: 0.9, lineHeight: 1.6 }}>
                  {pageData.subtitle}
                </p>
              )}
            </div>

            {/* Dynamic Center Sections Preview */}
            <div style={{ flex: 1, padding: '24px 0' }}>
              {pageData.sections.length === 0 ? (
                <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                  <p>This page currently has no center sections.</p>
                  <p style={{ fontSize: '0.8125rem' }}>Click &quot;Add Section&quot; in the left outline to add interactive content.</p>
                </div>
              ) : (
                pageData.sections.map((sec) => {
                  const isSelected = sec.id === selectedSectionId;
                  if (!sec.isVisible) {
                    return (
                      <div
                        key={sec.id}
                        onClick={() => setSelectedSectionId(sec.id)}
                        style={{
                          margin: '12px 24px',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px dashed var(--color-border)',
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <span>[Hidden Section] {sec.title}</span>
                        <EyeOff size={14} />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      style={{
                        position: 'relative',
                        padding: '36px 24px',
                        borderTop: '1px solid transparent',
                        borderBottom: '1px solid transparent',
                        outline: isSelected ? '2px solid var(--color-primary-600)' : '1px solid transparent',
                        outlineOffset: '-2px',
                        cursor: 'pointer',
                        transition: 'outline var(--transition-fast)'
                      }}
                    >
                      {/* Section Selection Tag */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '12px',
                            backgroundColor: 'var(--color-primary-600)',
                            color: '#ffffff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            zIndex: 10
                          }}
                        >
                          Editing: {sec.type}
                        </div>
                      )}

                      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        {sec.badge && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase' }}>
                            {sec.badge}
                          </span>
                        )}
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '6px 0 12px' }}>
                          {sec.title}
                        </h2>
                        {sec.subtitle && (
                          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginBottom: '16px' }}>
                            {sec.subtitle}
                          </p>
                        )}

                        {/* Section Content Body */}
                        {sec.content && (
                          <div style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>
                            {sec.content}
                          </div>
                        )}

                        {/* Feature Grid / Cards Items */}
                        {sec.items && sec.items.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: deviceMode === 'mobile' ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
                            {sec.items.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  padding: '16px',
                                  borderRadius: '8px',
                                  border: '1px solid var(--color-border)',
                                  backgroundColor: 'var(--color-surface)'
                                }}
                              >
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 6px' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                                  {item.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CTA Buttons */}
                        {sec.ctaText && (
                          <div style={{ marginTop: '20px' }}>
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                            >
                              {sec.ctaText}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Live Footer Simulation */}
            <div
              style={{
                padding: '24px',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)',
                textAlign: 'center'
              }}
            >
              <p style={{ margin: 0 }}>
                {themeSettings.footer.copyrightText.replace(/\{year\}/g, String(new Date().getFullYear()))}
              </p>
            </div>
          </div>
        </main>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT PANE: CONTEXTUAL INSPECTOR PANEL                             */}
        {/* ------------------------------------------------------------------ */}
        <aside
          style={{
            width: '360px',
            borderLeft: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {/* Inspector Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)'
            }}
          >
            <button
              type="button"
              onClick={() => setInspectorTab('content')}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                borderBottom: inspectorTab === 'content' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: inspectorTab === 'content' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('layout')}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                borderBottom: inspectorTab === 'layout' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: inspectorTab === 'layout' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Layout
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('style')}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                borderBottom: inspectorTab === 'style' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: inspectorTab === 'style' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Styling
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('seo')}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                borderBottom: inspectorTab === 'seo' ? '2px solid var(--color-primary-600)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: inspectorTab === 'seo' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Page SEO
            </button>
          </div>

          {/* Inspector Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {inspectorTab === 'seo' ? (
              /* SEO & METADATA SETTINGS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Search Engine & Social Settings</h4>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Meta Title ({pageData.seo.metaTitle.length}/60)
                  </label>
                  <input
                    type="text"
                    value={pageData.seo.metaTitle}
                    onChange={(e) => updatePage({ seo: { ...pageData.seo, metaTitle: e.target.value } })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Meta Description ({pageData.seo.metaDescription.length}/160)
                  </label>
                  <textarea
                    rows={3}
                    value={pageData.seo.metaDescription}
                    onChange={(e) => updatePage({ seo: { ...pageData.seo, metaDescription: e.target.value } })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Canonical URL Path
                  </label>
                  <input
                    type="text"
                    value={pageData.seo.canonicalPath}
                    onChange={(e) => updatePage({ seo: { ...pageData.seo, canonicalPath: e.target.value } })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>
            ) : !selectedSection ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                <p>Select a section from the left outline or click inside the preview to customize its properties.</p>
              </div>
            ) : inspectorTab === 'content' ? (
              /* SECTION CONTENT TAB */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    Type: {selectedSection.type.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleDuplicateSection(selectedSection.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                      title="Duplicate section"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(selectedSection.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.6875rem', color: '#ef4444' }}
                      title="Delete section"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Badge / Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={selectedSection.badge || ''}
                    onChange={(e) => updateSection(selectedSection.id, { badge: e.target.value })}
                    placeholder="e.g. Featured Program"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={selectedSection.title}
                    onChange={(e) => updateSection(selectedSection.id, { title: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Section Subtitle
                  </label>
                  <textarea
                    rows={2}
                    value={selectedSection.subtitle || ''}
                    onChange={(e) => updateSection(selectedSection.id, { subtitle: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem', resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                    Body Content (Markdown Supported)
                  </label>
                  <textarea
                    rows={5}
                    value={selectedSection.content || ''}
                    onChange={(e) => updateSection(selectedSection.id, { content: sanitizeContentText(e.target.value) })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem', fontFamily: 'monospace', resize: 'vertical' }}
                  />
                </div>

                {/* Primary CTA Button */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                    Action Button (CTA)
                  </label>
                  <input
                    type="text"
                    value={selectedSection.ctaText || ''}
                    onChange={(e) => updateSection(selectedSection.id, { ctaText: e.target.value })}
                    placeholder="Button Label (e.g. Explore Courses)"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem', marginBottom: '6px' }}
                  />
                  <input
                    type="text"
                    value={selectedSection.ctaUrl || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const check = validateUrlScheme(val);
                      if (!check.isValid) {
                        showNotice('error', check.error || 'Invalid URL scheme');
                      }
                      updateSection(selectedSection.id, { ctaUrl: val });
                    }}
                    placeholder="Button Target URL (e.g. /courses or https://)"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  />
                </div>
              </div>
            ) : inspectorTab === 'layout' ? (
              /* SECTION LAYOUT TAB */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Section Layout Geometry</h4>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Container Width
                  </label>
                  <select
                    value={selectedSection.layout?.containerWidth || 'standard'}
                    onChange={(e) => updateSection(selectedSection.id, { layout: { ...selectedSection.layout, containerWidth: e.target.value as any } })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  >
                    <option value="narrow">Narrow (960px)</option>
                    <option value="standard">Standard (1200px)</option>
                    <option value="wide">Wide (1440px)</option>
                    <option value="full">Full Width (100%)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Alignment
                  </label>
                  <select
                    value={selectedSection.layout?.alignment || 'center'}
                    onChange={(e) => updateSection(selectedSection.id, { layout: { ...selectedSection.layout, alignment: e.target.value as any } })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontSize: '0.8125rem' }}
                  >
                    <option value="left">Left Aligned</option>
                    <option value="center">Center Aligned</option>
                    <option value="right">Right Aligned</option>
                  </select>
                </div>
              </div>
            ) : (
              /* SECTION STYLING TAB */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <StyleInspector
                  elementLabel={`Section: ${selectedSection.title}`}
                  styleId={`section.${selectedSection.id}`}
                  override={overrides[`section.${selectedSection.id}`]}
                  onChange={(bp, partial) => {
                    updateElementOverride(`section.${selectedSection.id}`, bp, partial);
                    if (bp === 'base' && partial.backgroundColor) {
                      updateSection(selectedSection.id, {
                        layout: { ...selectedSection.layout, backgroundColor: partial.backgroundColor }
                      });
                    }
                  }}
                  onReset={() => resetElementOverride(`section.${selectedSection.id}`)}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ==================================================================== */}
      {/* 3. MODALS: ADD SECTION, PUBLISH CONFIRMATION, REVISION HISTORY        */}
      {/* ==================================================================== */}

      {/* ADD SECTION MODAL */}
      {showAddSectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>Choose Section Template</h3>
              <button type="button" onClick={() => setShowAddSectionModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { type: 'hero', label: 'Hero Banner', desc: 'Prominent headline, background media, and primary CTA.' },
                { type: 'split_media', label: 'Split Story & Media', desc: 'Narrative copy paired with high-impact demonstration photography.' },
                { type: 'feature_grid', label: 'Feature Pillars Grid', desc: 'Multi-column cards highlighting academic pillars or benefits.' },
                { type: 'faq', label: 'FAQ Accordion', desc: 'Collapsible admissions and curriculum inquiry answers.' },
                { type: 'cta', label: 'Call-to-Action Banner', desc: 'Direct enrollment and consultation conversion bar.' },
                { type: 'rich_text', label: 'Rich Text Article', desc: 'Markdown-supported long-form educational content block.' }
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => handleAddSectionTemplate(tmpl.type as any)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                    {tmpl.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {tmpl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH CONFIRMATION MODAL */}
      {showPublishModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={20} style={{ color: 'var(--color-primary-600)' }} />
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>Publish to Live Website</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              You are about to push your saved draft for <strong>&quot;{pageData.name}&quot; ({pageData.route})</strong> directly to the public live website.
              An immutable version snapshot will be created in the revision audit log.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setShowPublishModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handlePublishLive} className="btn btn-primary" style={{ fontWeight: 700 }}>
                Confirm & Publish Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY DRAWER */}
      {showHistoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '80vh',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  Revision History: {pageData.name}
                </h3>
              </div>
              <button type="button" onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
              {versionsLoading ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading snapshots...</p>
              ) : versions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem', padding: '24px 0' }}>
                  No published revision history yet. Versions are automatically recorded whenever you publish.
                </p>
              ) : (
                versions.map((ver) => (
                  <div
                    key={ver.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      marginBottom: '10px',
                      backgroundColor: 'var(--color-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)' }}>
                        Version #{ver.version_number} — {ver.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        By {ver.created_by_name || 'Staff'} • {new Date(ver.created_at).toLocaleString()}
                      </div>
                      {ver.change_summary && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '4px' }}>
                          {ver.change_summary}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(ver)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
