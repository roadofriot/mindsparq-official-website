import React, { useState, useEffect } from 'react';
import { getAllPrograms, saveProgram, deleteProgram } from '../../services/contentService';
import { Program } from '../../types/database';
import { Plus, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';

export const AdminProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPrograms = () => {
    setLoading(true);
    getAllPrograms()
      .then((data) => setPrograms(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleOpenCreate = () => {
    setEditingProgram({
      slug: '',
      title: '',
      summary: '',
      description: '',
      audience: '',
      icon_name: 'GraduationCap',
      sort_order: programs.length + 1,
      status: 'draft'
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prog: Program) => {
    setEditingProgram({ ...prog });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete program "${title}"?`)) return;
    const { error } = await deleteProgram(id);
    if (!error) {
      setPrograms((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    if (!editingProgram.slug || !/^[a-z0-9-]+$/.test(editingProgram.slug)) {
      setSaveError('Slug must contain only lowercase alphanumeric characters and hyphens.');
      return;
    }
    if (!editingProgram.title?.trim()) {
      setSaveError('Title is required.');
      return;
    }
    if (!editingProgram.summary?.trim()) {
      setSaveError('Summary is required.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const { data, error } = await saveProgram(editingProgram);

    if (error) {
      setSaveError(error.message);
    } else if (data) {
      setIsModalOpen(false);
      fetchPrograms();
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Curriculum Programs
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Manage the official educational offerings, target age brackets, and program descriptions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Add Program
        </button>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading programs...
          </div>
        ) : programs.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <GraduationCap size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              No custom programs saved in database yet. The website is displaying the core static programs.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-secondary">
              Create First Program
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Order</th>
                <th style={{ padding: 'var(--space-3)' }}>Title & Slug</th>
                <th style={{ padding: 'var(--space-3)' }}>Target Audience</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((prog) => (
                <tr key={prog.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{prog.sort_order}</td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{prog.title}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>/{prog.slug}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                    {prog.audience || 'General'}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 600,
                        backgroundColor:
                          prog.status === 'published'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : prog.status === 'draft'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(107, 114, 128, 0.1)',
                        color:
                          prog.status === 'published'
                            ? '#10b981'
                            : prog.status === 'draft'
                            ? '#d97706'
                            : '#6b7280',
                        textTransform: 'capitalize'
                      }}
                    >
                      {prog.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => handleOpenEdit(prog)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(prog.id, prog.title)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && editingProgram && (
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
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              {editingProgram.id ? 'Edit Curriculum Program' : 'Create New Program'}
            </h2>

            {saveError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-xs)',
                  marginBottom: 'var(--space-4)'
                }}
              >
                <AlertCircle size={16} /> {saveError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProgram.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = !editingProgram.id
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                        : editingProgram.slug;
                      setEditingProgram({ ...editingProgram, title, slug });
                    }}
                    placeholder="e.g. Abacus & Mental Math"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    URL Slug (kebab-case) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProgram.slug || ''}
                    onChange={(e) => setEditingProgram({ ...editingProgram, slug: e.target.value })}
                    placeholder="e.g. abacus-mental-math"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Target Audience
                </label>
                <input
                  type="text"
                  value={editingProgram.audience || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, audience: e.target.value })}
                  placeholder="e.g. Ages 5-13, Grade 6 & Above"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Summary (Short description for card) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingProgram.summary || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, summary: e.target.value })}
                  placeholder="Brief overview of the program's purpose..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Full Description & Pedagogy *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingProgram.description || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  placeholder="Detailed breakdown of methodology, skills acquired, and structure..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingProgram.sort_order ?? 0}
                    onChange={(e) => setEditingProgram({ ...editingProgram, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingProgram.status || 'draft'}
                    onChange={(e) => setEditingProgram({ ...editingProgram, status: e.target.value as 'draft' | 'published' | 'archived' })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="published">Published (Live)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Program'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
