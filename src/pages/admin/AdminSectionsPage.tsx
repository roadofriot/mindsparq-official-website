import React, { useState, useEffect } from 'react';
import {
  getSiteSections,
  saveSiteSection,
  reorderSiteSections,
  resetDefaultSections,
  SiteSection
} from '../../services/siteCustomizerService';
import {
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSectionsPage: React.FC = () => {
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSections = async () => {
    setLoading(true);
    const data = await getSiteSections();
    setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, []);

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

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setSaving(true);
    const { success, error } = await saveSiteSection(editingSection);
    if (success) {
      setSections((prev) => prev.map((s) => (s.id === editingSection.id ? editingSection : s)));
      setEditingSection(null);
      setStatusNotice({ type: 'success', text: `Section "${editingSection.name}" updated successfully!` });
      setTimeout(() => setStatusNotice(null), 3000);
    } else {
      alert(`Save error: ${error?.message || 'Failed to update section'}`);
    }
    setSaving(false);
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all homepage sections to original MindSparQ defaults? Custom changes will be restored.')) return;
    const defaults = await resetDefaultSections();
    setSections(defaults);
    setStatusNotice({ type: 'success', text: 'All homepage sections restored to factory defaults.' });
    setTimeout(() => setStatusNotice(null), 3500);
  };

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
              Visual Section Customizer
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(36, 87, 214, 0.12)',
                color: 'var(--color-primary-600)',
                border: '1px solid rgba(36, 87, 214, 0.3)'
              }}
            >
              Phase 3 Visual CMS
            </span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: '4px 0 0' }}>
            Control section order, visibility, headlines, and narrative copy on the public homepage without modifying code.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link
            to="/"
            target="_blank"
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={15} />
            <span>View Public Site</span>
          </Link>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Restore factory default sections"
          >
            <RotateCcw size={15} />
            <span>Reset Defaults</span>
          </button>
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

      {/* Sections Table / Cards */}
      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading configurable sections...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)', width: '60px' }}>Order</th>
                <th style={{ padding: 'var(--space-3)' }}>Section Name & Key</th>
                <th style={{ padding: 'var(--space-3)' }}>Badge & Headline Title</th>
                <th style={{ padding: 'var(--space-3)', width: '120px' }}>Visibility</th>
                <th style={{ padding: 'var(--space-3)', width: '100px' }}>Reorder</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right', width: '90px' }}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec, idx) => (
                <tr
                  key={sec.id}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    opacity: sec.is_visible ? 1 : 0.6,
                    backgroundColor: sec.is_visible ? 'transparent' : 'rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <td style={{ padding: 'var(--space-3)', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                    #{idx + 1}
                  </td>

                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{sec.name}</div>
                    <code style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                      key: {sec.key}
                    </code>
                  </td>

                  <td style={{ padding: 'var(--space-3)' }}>
                    {sec.badge && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(36, 87, 214, 0.1)',
                          color: 'var(--color-primary-600)',
                          marginBottom: '3px'
                        }}
                      >
                        {sec.badge}
                      </span>
                    )}
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{sec.title}</div>
                    <div
                      style={{
                        fontSize: 'var(--font-xs)',
                        color: 'var(--color-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '360px'
                      }}
                    >
                      {sec.subtitle}
                    </div>
                  </td>

                  <td style={{ padding: 'var(--space-3)' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(sec)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: sec.is_visible ? 'rgba(16, 185, 129, 0.12)' : 'rgba(107, 114, 128, 0.12)',
                        color: sec.is_visible ? '#10b981' : '#6b7280'
                      }}
                      title="Click to toggle live visibility"
                    >
                      {sec.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span>{sec.is_visible ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </td>

                  <td style={{ padding: 'var(--space-3)' }}>
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
                          padding: '3px',
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
                          padding: '3px',
                          color: 'var(--color-text)'
                        }}
                        title="Move Section Down"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setEditingSection({ ...sec })}
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
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
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0 }}>
                  Edit Section: {editingSection.name}
                </h2>
                <code style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  key: {editingSection.key}
                </code>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Badge Tag (Optional)
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

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Section Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingSection.title}
                  onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Subtitle / Descriptive Copy
                </label>
                <textarea
                  rows={3}
                  value={editingSection.subtitle}
                  onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)' }}>
                <input
                  type="checkbox"
                  id="sectionVisibility"
                  checked={editingSection.is_visible}
                  onChange={(e) => setEditingSection({ ...editingSection, is_visible: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="sectionVisibility" style={{ fontSize: 'var(--font-sm)', cursor: 'pointer', margin: 0, fontWeight: 600 }}>
                  Section is Visible on Public Homepage
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving...' : 'Save Section'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
