import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  getSiteSections,
  saveSiteSection,
  deleteSiteSection,
  reorderSiteSections,
  resetDefaultSections,
  createCustomBlockTemplate,
  publishSiteSections,
  SiteSection,
  CustomBlockType,
  SectionLayoutStyle,
  DEFAULT_SECTION_LAYOUT
} from '../../services/siteCustomizerService';
import { useStyleOverrides } from '../../hooks/useStyleOverrides';
import { StyleInspector } from '../../components/admin/StyleInspector';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  Layout,
  Sliders,
  Smartphone,
  Tablet,
  Monitor,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
  Video,
  HelpCircle,
  BarChart3,
  Columns
} from 'lucide-react';
import { reviewWebsiteSectionContent, sendGeminiPrompt } from '../../services/geminiService';
import { DynamicSectionWrapper } from '../../components/home/DynamicSectionWrapper';
import { CustomBlockRenderer } from '../../components/home/CustomBlockRenderer';
import { AccessibleHint } from '../../components/ui/AccessibleHint';

export const AdminSectionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    overrides,
    updateElementOverride,
    resetElementOverride,
    saveDraft: saveStyleDraft,
    publishLive: publishStyleLive
  } = useStyleOverrides({ mode: 'draft' });

  // Modal Sub-navigation
  const [activeTab, setActiveTab] = useState<'content' | 'layout' | 'styling' | 'ai' | 'preview'>('content');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  // AI Content Advisor state
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [aiCustomQuestion, setAiCustomQuestion] = useState('');
  const [aiCustomAnswer, setAiCustomAnswer] = useState<string | null>(null);
  const [aiReviewResult, setAiReviewResult] = useState<{
    score: number;
    critique: string;
    suggestions: string[];
    improvedTitle: string;
    improvedSubtitle: string;
  } | null>(null);

  const loadSections = async () => {
    setLoading(true);
    const data = await getSiteSections('draft');
    setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Deep edit handler from search params (e.g. ?edit=about_snippet)
  useEffect(() => {
    const editKey = searchParams.get('edit');
    if (editKey && sections.length > 0) {
      const match = sections.find(
        (s) => s.key === editKey || s.id === editKey || s.id === `sec-${editKey}`
      );
      if (match) {
        setEditingSection({ ...match });
        setActiveTab('content');
      }
    }
  }, [searchParams, sections]);

  const handleToggleVisibility = async (sec: SiteSection) => {
    const updated = { ...sec, is_visible: !sec.is_visible };
    const { success } = await saveSiteSection(updated);
    if (success) {
      setSections((prev) => prev.map((s) => (s.id === sec.id ? updated : s)));
      setStatusNotice({
        type: 'success',
        text: `Section "${sec.name}" is now ${updated.is_visible ? 'VISIBLE on homepage' : 'HIDDEN from homepage'}.`
      });
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);
    await reorderSiteSections(newSections.map((s) => s.id));
  };

  const handleSaveModal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    const { success, error } = await saveSiteSection(editingSection);
    await saveStyleDraft();

    if (success) {
      setSections((prev) => {
        const idx = prev.findIndex((s) => s.id === editingSection.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = editingSection;
          return updated;
        }
        return [...prev, editingSection];
      });
      setStatusNotice({ type: 'success', text: `Section "${editingSection.name}" and design styles saved as draft! Remember to press "Publish to Live Site" to go live.` });
      setTimeout(() => setStatusNotice(null), 4000);
      setEditingSection(null);
      setSearchParams({});
    } else {
      alert(`Save error: ${error?.message || 'Failed to update section'}`);
    }
    setSaving(false);
  };

  const handlePublishLive = async () => {
    setPublishing(true);
    try {
      const secRes = await publishSiteSections('Staff Admin', 'Published homepage sections and visual styles to live site');
      const styleRes = await publishStyleLive('Staff Admin', 'Published homepage sections and visual styles to live site');
      if (secRes.success && styleRes.success) {
        setStatusNotice({
          type: 'success',
          text: `Homepage sections and design styles published live successfully! (Version ${secRes.version})`
        });
        setTimeout(() => setStatusNotice(null), 5000);
      } else {
        setStatusNotice({
          type: 'error',
          text: secRes.error?.message || styleRes.error?.message || 'Failed to publish to live site.'
        });
      }
    } catch (err: any) {
      setStatusNotice({ type: 'error', text: err?.message || 'Publish error' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteSection = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete custom block "${name}"? This cannot be undone.`)) return;

    const ok = await deleteSiteSection(id);
    if (ok) {
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (editingSection?.id === id) setEditingSection(null);
      setStatusNotice({ type: 'success', text: `Block "${name}" deleted.` });
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  const handleCreateCustomBlock = (type: CustomBlockType) => {
    const newBlock = createCustomBlockTemplate(type);
    setEditingSection(newBlock);
    setActiveTab('content');
    setShowBlockPicker(false);
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all homepage sections to original MindSparQ defaults? Custom changes will be restored.')) return;
    const defaults = await resetDefaultSections();
    setSections(defaults);
    setStatusNotice({ type: 'success', text: 'All homepage sections restored to factory defaults.' });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  // AI Content Evaluation
  const handleGetAiReview = async () => {
    if (!editingSection) return;
    setAiReviewLoading(true);
    try {
      const res = await reviewWebsiteSectionContent({
        sectionName: editingSection.name,
        badge: editingSection.badge,
        title: editingSection.title,
        subtitle: editingSection.subtitle
      });
      setAiReviewResult(res);
    } catch {
      // ignore
    } finally {
      setAiReviewLoading(false);
    }
  };

  const handleApplyAiSuggestions = () => {
    if (!aiReviewResult || !editingSection) return;
    setEditingSection({
      ...editingSection,
      title: aiReviewResult.improvedTitle,
      subtitle: aiReviewResult.improvedSubtitle
    });
    setStatusNotice({ type: 'success', text: 'AI optimized headline and subtitle applied! Click "Save & Publish" to update.' });
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleAskCustomQuestion = async (customQ?: string) => {
    const q = (customQ || aiCustomQuestion).trim();
    if (!q || !editingSection) return;
    setAiReviewLoading(true);
    setAiCustomAnswer(null);
    try {
      const prompt = `Section context: "${editingSection.name}"
Current Title: "${editingSection.title}"
Current Subtitle: "${editingSection.subtitle}"
Current Badge: "${editingSection.badge || 'None'}"

Administrator Request / Question: "${q}"

Provide:
1. Direct, professional advice on how to optimize this section for students and parents in Butwal.
2. An estimated Quality Score percentage (e.g. 94%).
3. Specific improved copy suggestions for Title and Subtitle.`;

      const res = await sendGeminiPrompt(
        prompt,
        undefined,
        'You are the MindSparQ AI Senior Creative Director. Answer directly, concisely, providing high-converting copy improvements and quality scores.'
      );
      setAiCustomAnswer(res);
    } catch (err: any) {
      setAiCustomAnswer(`Error querying AI: ${err.message}`);
    } finally {
      setAiReviewLoading(false);
    }
  };

  const updateLayoutStyle = (updates: Partial<SectionLayoutStyle>) => {
    if (!editingSection) return;
    setEditingSection({
      ...editingSection,
      layout_style: {
        ...(editingSection.layout_style || DEFAULT_SECTION_LAYOUT),
        ...updates
      }
    });
  };

  // Keyboard shortcuts for quick actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!isInput && e.altKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setShowBlockPicker(true);
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleResetDefaults();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      {/* Page Title & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
              Visual Section & Layout Studio
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}
            >
              MindSparQ Enterprise CMS
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: '4px 0 0' }}>
            Control section order, layout dimensions, padding, height, typography scale, backgrounds, and add custom blocks without touching code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <AccessibleHint text="Publish current draft sections and visual styles to external live visitors" shortcut="Alt+P">
            <button
              type="button"
              disabled={publishing}
              onClick={handlePublishLive}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Sparkles size={16} />
              <span>{publishing ? 'Publishing Live...' : 'Publish to Live Site'}</span>
            </button>
          </AccessibleHint>

          <AccessibleHint text="Add a new custom component (grid, media, rich text, CTA) to homepage" shortcut="Alt+N">
            <button
              type="button"
              onClick={() => setShowBlockPicker(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add Custom Block</span>
            </button>
          </AccessibleHint>

          <AccessibleHint text="Open live public homepage in a new browser tab" shortcut="Alt+V">
            <Link
              to="/"
              target="_blank"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={15} />
              <span>View Public Site</span>
            </Link>
          </AccessibleHint>

          <AccessibleHint text="Reset all homepage sections to verified institutional factory defaults" shortcut="Alt+R">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>
          </AccessibleHint>
        </div>
      </div>

      {/* Status Notice Toast */}
      {statusNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: statusNotice.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: statusNotice.type === 'success' ? '#10b981' : '#ef4444',
            border: `1px solid ${statusNotice.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-sm)',
            fontWeight: 600
          }}
        >
          {statusNotice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusNotice.text}</span>
        </div>
      )}

      {/* Sections Table & Layout Studio Cards */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading site sections and layout registry...
          </div>
        ) : (
          <table>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Order
                </th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Section / Block Name
                </th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Headline & Subtitle
                </th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Width & Height
                </th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Visibility
                </th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Reorder
                </th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, idx) => {
                const layout = sec.layout_style || {};
                const isCustom = Boolean(sec.block_type && sec.block_type !== 'default');

                return (
                  <tr
                    key={sec.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: sec.is_visible ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      opacity: sec.is_visible ? 1 : 0.65
                    }}
                  >
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700, fontSize: 'var(--font-sm)', color: '#38bdf8' }}>
                      #{idx + 1}
                    </td>

                    <td style={{ padding: 'var(--space-3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                          {sec.name}
                        </span>
                        {isCustom && (
                          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', fontWeight: 700 }}>
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                        key: {sec.key}
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3)', maxWidth: '320px' }}>
                      <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sec.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sec.subtitle || '—'}
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 600 }}>
                        {layout.containerWidth || 'standard'} · {layout.minHeight || 'auto'}
                      </span>
                    </td>

                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(sec)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: sec.is_visible ? '#10b981' : '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                        title={sec.is_visible ? 'Click to Hide on Homepage' : 'Click to Show on Homepage'}
                      >
                        {sec.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span>{sec.is_visible ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.3 : 1,
                            padding: '4px',
                            color: 'var(--color-text)'
                          }}
                          title="Move Section Up"
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: idx === sections.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === sections.length - 1 ? 0.3 : 1,
                            padding: '4px',
                            color: 'var(--color-text)'
                          }}
                          title="Move Section Down"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSection({ ...sec });
                            setActiveTab('content');
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Sliders size={13} />
                          <span>Customize</span>
                        </button>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(sec.id, sec.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer'
                            }}
                            title="Delete custom block"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Block Template Picker Modal */}
      {showBlockPicker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 20, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '16px'
          }}
          onClick={() => setShowBlockPicker(false)}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '24px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-surface, #0b1329)',
              border: '1px solid var(--color-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--color-text, #ffffff)' }}>
                  Add New Custom Section Block
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                  Choose a pre-styled MindSparQ block template to insert into your homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockPicker(false)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { type: 'rich_text' as CustomBlockType, label: 'Editorial / Rich Text', desc: 'Markdown article prose, bullet points & CTA', icon: FileText, color: '#38bdf8' },
                { type: 'feature_grid' as CustomBlockType, label: 'Feature Grid (3 Cards)', desc: 'Highlight cards with icons and descriptions', icon: Columns, color: '#10b981' },
                { type: 'split_media' as CustomBlockType, label: 'Split Media & Hero', desc: '50/50 image & narrative checklist split', icon: Layout, color: '#8b5cf6' },
                { type: 'stats_strip' as CustomBlockType, label: 'Statistics Strip', desc: 'Big bold metrics & achievement numbers', icon: BarChart3, color: '#f59e0b' },
                { type: 'video_showcase' as CustomBlockType, label: 'Video Showcase', desc: '16:9 responsive YouTube video embed', icon: Video, color: '#ec4899' },
                { type: 'faq_accordion' as CustomBlockType, label: 'FAQ Accordion', desc: 'Collapsible Q&A for parents and students', icon: HelpCircle, color: '#06b6d4' },
                { type: 'cta_banner' as CustomBlockType, label: 'Call-to-Action Banner', desc: 'High-converting announcement card with buttons', icon: Sparkles, color: '#e11d48' }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    onClick={() => handleCreateCustomBlock(item.type)}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.backgroundColor = `${item.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: `${item.color}25`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text, #ffffff)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full-Featured Section Layout & Customizer Studio Modal */}
      {editingSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 10, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingSection(null);
              setSearchParams({});
            }
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '960px',
              height: '92vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--color-surface, #0b1329)',
              borderRadius: '20px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(255, 255, 255, 0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-text, #ffffff)' }}>
                    Customize: {editingSection.name}
                  </h2>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }}>
                    {editingSection.block_type || 'Core Section'}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)', fontFamily: 'monospace' }}>
                  key: {editingSection.key}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null);
                    setSearchParams({});
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveModal()}
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save & Publish'}</span>
                </button>
              </div>
            </div>

            {/* Studio Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 24px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                overflowX: 'auto'
              }}
            >
              {[
                { key: 'content', label: '✍️ Content & Copy' },
                { key: 'layout', label: '📐 Layout & Sizing Studio' },
                { key: 'styling', label: '🎨 Background & Surfaces' },
                { key: 'ai', label: '✨ AI Creative Director' },
                { key: 'preview', label: '📱 Live Frame Preview' }
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                      backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: isActive ? '#38bdf8' : 'var(--color-text-secondary, #94a3b8)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* TAB 1: Content & Copy */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '780px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                      Badge Tag / Overline Pill (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingSection.badge || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, badge: e.target.value })}
                      placeholder="e.g. Featured Announcement, Academic Programs, Why MindSparQ"
                      className="input-field"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                      Section Headline / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingSection.title}
                      onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                      className="input-field"
                      style={{ width: '100%', fontSize: '16px', fontWeight: 600 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                      Subtitle / Narrative Lead Copy
                    </label>
                    <textarea
                      rows={3}
                      value={editingSection.subtitle}
                      onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                      className="input-field"
                      style={{ width: '100%', resize: 'vertical' }}
                    />
                  </div>

                  {/* Primary & Secondary Buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text)' }}>
                        Primary CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={editingSection.layout_style?.ctaButtonText || editingSection.content_json?.cta_label || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSection({
                            ...editingSection,
                            layout_style: { ...editingSection.layout_style, ctaButtonText: val },
                            content_json: { ...editingSection.content_json, cta_label: val }
                          });
                        }}
                        placeholder="e.g. Enroll Now, Explore Programs"
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text)' }}>
                        Primary CTA Destination URL
                      </label>
                      <input
                        type="text"
                        value={editingSection.layout_style?.ctaButtonUrl || editingSection.content_json?.cta_url || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingSection({
                            ...editingSection,
                            layout_style: { ...editingSection.layout_style, ctaButtonUrl: val },
                            content_json: { ...editingSection.content_json, cta_url: val }
                          });
                        }}
                        placeholder="e.g. /programs, /contact"
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  {/* Block Specific Custom Fields */}
                  {editingSection.block_type === 'rich_text' && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text)' }}>
                        Markdown Editorial Body Text
                      </label>
                      <textarea
                        rows={8}
                        value={editingSection.content_json?.markdownBody || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          content_json: { ...editingSection.content_json, markdownBody: e.target.value }
                        })}
                        className="input-field"
                        style={{ width: '100%', fontFamily: 'monospace', resize: 'vertical' }}
                      />
                    </div>
                  )}

                  {editingSection.block_type === 'split_media' && (
                    <div style={{ marginTop: '12px' }}>
                      <ImageUploadField
                        label="Media Image (Computer / Phone or Link)"
                        value={editingSection.content_json?.imageUrl || ''}
                        onChange={(url) => setEditingSection({
                          ...editingSection,
                          content_json: { ...editingSection.content_json, imageUrl: url }
                        })}
                        placeholder="https://images.unsplash.com/... or choose from device"
                        helperText="Upload an image directly from your computer or enter an external image URL for the split banner."
                        recommendedDimensions="1200x800 px"
                      />
                    </div>
                  )}

                  {editingSection.block_type === 'video_showcase' && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px', color: 'var(--color-text)' }}>
                        YouTube Video ID or Full Link
                      </label>
                      <input
                        type="text"
                        value={editingSection.content_json?.youtubeVideoId || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          content_json: { ...editingSection.content_json, youtubeVideoId: e.target.value }
                        })}
                        placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=..."
                        className="input-field"
                        style={{ width: '100%' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.04)', marginTop: '8px' }}>
                    <input
                      type="checkbox"
                      id="modalVisibilityCheck"
                      checked={editingSection.is_visible}
                      onChange={(e) => setEditingSection({ ...editingSection, is_visible: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="modalVisibilityCheck" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', cursor: 'pointer', margin: 0 }}>
                      Section is Published & Visible on Public Homepage
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: Layout & Geometry Studio */}
              {activeTab === 'layout' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '780px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#38bdf8' }}>
                      Enterprise Section Dimensions & Box Model
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                      Adjust container width, section min-height, top/bottom padding, and typography scaling directly.
                    </p>
                  </div>

                  {/* Container Max Width */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-text)' }}>
                      Container Maximum Width
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {[
                        { key: 'narrow', label: 'Narrow', sub: '960px max' },
                        { key: 'standard', label: 'Boxed Standard', sub: '1200px max' },
                        { key: 'wide', label: 'Wide Screen', sub: '1440px max' },
                        { key: 'full', label: 'Full Edge-to-Edge', sub: '100% width' }
                      ].map((item) => {
                        const isSel = (editingSection.layout_style?.containerWidth || 'standard') === item.key;
                        return (
                          <div
                            key={item.key}
                            onClick={() => updateLayoutStyle({ containerWidth: item.key as any })}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: isSel ? '2px solid #38bdf8' : '1px solid var(--color-border)',
                              backgroundColor: isSel ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isSel ? '#38bdf8' : 'var(--color-text)' }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #94a3b8)' }}>
                              {item.sub}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Height / Min-Height */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-text)' }}>
                      Section Height / Min-Height
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {[
                        { key: 'auto', label: 'Auto (Content Fit)' },
                        { key: 'compact', label: 'Compact (360px)' },
                        { key: 'medium', label: 'Medium (520px)' },
                        { key: 'screen', label: 'Full Screen (100vh)' }
                      ].map((item) => {
                        const isSel = (editingSection.layout_style?.minHeight || 'auto') === item.key;
                        return (
                          <div
                            key={item.key}
                            onClick={() => updateLayoutStyle({ minHeight: item.key as any })}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: isSel ? '2px solid #38bdf8' : '1px solid var(--color-border)',
                              backgroundColor: isSel ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isSel ? '#38bdf8' : 'var(--color-text)' }}>
                              {item.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top & Bottom Padding */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                        Top Padding (Spacing)
                      </label>
                      <select
                        value={editingSection.layout_style?.paddingTop || 'md'}
                        onChange={(e) => updateLayoutStyle({ paddingTop: e.target.value as any })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="none">None (0px)</option>
                        <option value="sm">Compact (24px)</option>
                        <option value="md">Standard (48px)</option>
                        <option value="lg">Generous (80px)</option>
                        <option value="xl">Hero Scale (120px)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                        Bottom Padding (Spacing)
                      </label>
                      <select
                        value={editingSection.layout_style?.paddingBottom || 'md'}
                        onChange={(e) => updateLayoutStyle({ paddingBottom: e.target.value as any })}
                        className="input-field"
                        style={{ width: '100%' }}
                      >
                        <option value="none">None (0px)</option>
                        <option value="sm">Compact (24px)</option>
                        <option value="md">Standard (48px)</option>
                        <option value="lg">Generous (80px)</option>
                        <option value="xl">Hero Scale (120px)</option>
                      </select>
                    </div>
                  </div>

                  {/* Content Alignment */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--color-text)' }}>
                      Content Alignment
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[
                        { key: 'left', label: 'Left Aligned', icon: AlignLeft },
                        { key: 'center', label: 'Centered', icon: AlignCenter },
                        { key: 'right', label: 'Right Aligned', icon: AlignRight }
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSel = (editingSection.layout_style?.alignment || 'left') === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => updateLayoutStyle({ alignment: item.key as any })}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '8px',
                              border: isSel ? '2px solid #38bdf8' : '1px solid var(--color-border)',
                              backgroundColor: isSel ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                              color: isSel ? '#38bdf8' : 'var(--color-text)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              cursor: 'pointer',
                              fontWeight: isSel ? 700 : 500
                            }}
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Heading Typography Scale */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', color: 'var(--color-text)' }}>
                      Heading Typography Scale
                    </label>
                    <select
                      value={editingSection.layout_style?.headingScale || 'md'}
                      onChange={(e) => updateLayoutStyle({ headingScale: e.target.value as any })}
                      className="input-field"
                      style={{ width: '100%' }}
                    >
                      <option value="sm">Compact (1.5rem / 24px)</option>
                      <option value="md">Regular Headline (2rem / 32px)</option>
                      <option value="lg">Large Display (2.5rem / 40px)</option>
                      <option value="display">Hero Impact Display (3.25rem / 52px)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: Visual Styling & Layout Geometry */}
              {activeTab === 'styling' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '780px' }}>
                  <StyleInspector
                    elementLabel={`Section: ${editingSection.name || editingSection.title}`}
                    styleId={`section.${editingSection.key}`}
                    override={overrides[`section.${editingSection.key}`]}
                    onChange={(bp, partial) => {
                      updateElementOverride(`section.${editingSection.key}`, bp, partial);
                      if (bp === 'base' && partial.backgroundColor) {
                        updateLayoutStyle({ backgroundColor: partial.backgroundColor });
                      }
                    }}
                    onReset={() => resetElementOverride(`section.${editingSection.key}`)}
                  />
                </div>
              )}

              {/* TAB 4: AI Creative Director */}
              {activeTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '780px' }}>
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      backgroundColor: 'rgba(99, 102, 241, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} style={{ color: '#6366f1' }} />
                        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text, #ffffff)' }}>
                          Gemini AI Copy Audit & Quality Score
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={aiReviewLoading || !editingSection.title}
                        onClick={handleGetAiReview}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Wand2 size={14} />
                        <span>{aiReviewLoading ? 'Analyzing...' : 'Audit Quality Score'}</span>
                      </button>
                    </div>

                    {aiReviewResult && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, backgroundColor: aiReviewResult.score >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: aiReviewResult.score >= 90 ? '#10b981' : '#d97706' }}>
                            Quality Score: {aiReviewResult.score}%
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
                          {aiReviewResult.critique}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={handleApplyAiSuggestions}
                            className="btn btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            Apply AI Optimized Copy
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(99, 102, 241, 0.15)' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                        Ask AI Assistant for Advice & Modifications:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={aiCustomQuestion}
                          onChange={(e) => setAiCustomQuestion(e.target.value)}
                          placeholder="e.g. How can I make this headline more attractive for parents in Butwal?"
                          className="input-field"
                          style={{ flex: 1, fontSize: '13px' }}
                        />
                        <button
                          type="button"
                          disabled={aiReviewLoading || !aiCustomQuestion.trim()}
                          onClick={() => handleAskCustomQuestion()}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          Ask
                        </button>
                      </div>

                      {aiCustomAnswer && (
                        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '13px', lineHeight: 1.55 }}>
                          {aiCustomAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Live Responsive Device Frame Preview */}
              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Device frame switcher */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '6px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', width: 'fit-content', margin: '0 auto' }}>
                    {[
                      { key: 'desktop', label: 'Desktop (100%)', icon: Monitor },
                      { key: 'tablet', label: 'Tablet (768px)', icon: Tablet },
                      { key: 'mobile', label: 'Mobile (375px)', icon: Smartphone }
                    ].map((dev) => {
                      const Icon = dev.icon;
                      const isSel = previewDevice === dev.key;
                      return (
                        <button
                          key={dev.key}
                          type="button"
                          onClick={() => setPreviewDevice(dev.key as any)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isSel ? '#38bdf8' : 'transparent',
                            color: isSel ? '#000000' : 'var(--color-text-secondary)',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <Icon size={14} />
                          <span>{dev.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Simulator Box */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      overflowX: 'auto',
                      padding: '16px',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div
                      style={{
                        width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                        transition: 'width 0.25s ease',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: previewDevice === 'mobile' ? '24px' : '12px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-bg, #070e1a)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <DynamicSectionWrapper section={editingSection}>
                        <CustomBlockRenderer section={editingSection} />
                      </DynamicSectionWrapper>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Status: <strong style={{ color: editingSection.is_visible ? '#10b981' : '#ef4444' }}>{editingSection.is_visible ? 'Visible on Homepage' : 'Hidden'}</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSection(null);
                    setSearchParams({});
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveModal()}
                  className="btn btn-primary"
                  style={{ padding: '6px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Publishing...' : 'Save & Publish Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
