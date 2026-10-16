import React, { useState, useEffect } from 'react';
import { getAllCarouselItems, saveCarouselItem, deleteCarouselItem } from '../../services/contentService';
import { CarouselItem } from '../../types/database';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

export const AdminCarouselPage: React.FC = () => {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<CarouselItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchItems = () => {
    setLoading(true);
    getAllCarouselItems()
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem({
      title: '',
      subtitle: '',
      image_url: '',
      mobile_image_url: '',
      alt_text: '',
      cta_label: 'Explore Programs',
      cta_url: '/programs',
      sort_order: items.length + 1,
      status: 'published'
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: CarouselItem) => {
    setEditingItem({ ...item });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete carousel slide "${title}"?`)) return;
    const { error } = await deleteCarouselItem(id);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!editingItem.title?.trim()) {
      setSaveError('Title is required.');
      return;
    }
    if (!editingItem.image_url?.trim()) {
      setSaveError('Desktop image URL is required.');
      return;
    }
    // Auto-populate alt text if empty so users are not blocked
    if (!editingItem.alt_text?.trim()) {
      editingItem.alt_text = editingItem.title || 'MindSparQ Hero Carousel Banner';
    }

    // If saving the fallback slide, treat it as a new insert in the database
    const itemToSave = { ...editingItem };
    if (itemToSave.id === 'mindsparq-innovation-banner-slide') {
      delete itemToSave.id;
    }

    setSaving(true);
    setSaveError(null);
    const { data, error } = await saveCarouselItem(itemToSave);

    if (error) {
      setSaveError(error.message);
    } else if (data) {
      setIsModalOpen(false);
      fetchItems();
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Homepage Carousel Slides
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Manage the hero banner presentation, call-to-actions, and responsive imagery on the main landing page.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Add New Slide
        </button>
      </div>

      {/* Slides Table */}
      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading slides...
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              No carousel slides configured yet. The homepage will display its built-in hero fallback.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-secondary">
              Create First Slide
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Order</th>
                <th style={{ padding: 'var(--space-3)' }}>Preview</th>
                <th style={{ padding: 'var(--space-3)' }}>Title & Subtitle</th>
                <th style={{ padding: 'var(--space-3)' }}>CTA Button</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{item.sort_order}</td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ width: '80px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--color-surface-hover)' }}>
                      <img src={item.image_url} alt={item.alt_text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.title}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>{item.subtitle || 'No subtitle'}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                    {item.cta_label ? (
                      <span style={{ color: 'var(--color-primary-600)', fontWeight: 500 }}>
                        {item.cta_label} ({item.cta_url})
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-secondary)' }}>None</span>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 600,
                        backgroundColor:
                          item.status === 'published'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : item.status === 'draft'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(107, 114, 128, 0.1)',
                        color:
                          item.status === 'published'
                            ? '#10b981'
                            : item.status === 'draft'
                            ? '#d97706'
                            : '#6b7280',
                        textTransform: 'capitalize'
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Slide"
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        title="Delete Slide"
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

      {/* Edit / Create Modal */}
      {isModalOpen && editingItem && (
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
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              {editingItem.id ? 'Edit Carousel Slide' : 'Create Carousel Slide'}
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
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Empowering Minds, Sparking Innovation"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={editingItem.subtitle === '__HIDE_TEXT__' ? '' : (editingItem.subtitle || '')}
                  onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                  placeholder="e.g. Next-generation cognitive skill development in Nepal"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)', padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  type="checkbox"
                  id="hideTextOverlay"
                  checked={editingItem.subtitle === '__HIDE_TEXT__'}
                  onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.checked ? '__HIDE_TEXT__' : '' })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="hideTextOverlay" style={{ fontSize: 'var(--font-xs)', cursor: 'pointer', margin: 0, color: 'var(--color-text)' }}>
                  <strong>Hide text overlay card on this slide</strong> (Recommended if your uploaded banner image already includes text, flyer typography, or phone numbers)
                </label>
              </div>

              <ImageUploadField
                label="Desktop Image (Hero Carousel)"
                value={editingItem.image_url || ''}
                onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                required
                altTextDefault={editingItem.alt_text || editingItem.title || 'Hero Banner'}
                placeholder="Or paste external desktop banner URL (https://...)..."
                recommendedDimensions="1920 × 800 px (21:9 Widescreen) or 1920 × 1080 px (16:9)"
                helperText="Widescreen aspect ratio (21:9 or 16:9). PNG, JPG, or WebP up to 10MB."
              />

              <ImageUploadField
                label="Mobile Image (Optional)"
                value={editingItem.mobile_image_url || ''}
                onChange={(url) => setEditingItem({ ...editingItem, mobile_image_url: url })}
                altTextDefault={`${editingItem.title || 'Hero Banner'} Mobile`}
                placeholder="Or paste external mobile banner URL (https://...)..."
                recommendedDimensions="1080 × 1080 px (1:1 Square) or 1080 × 1350 px (4:5 Portrait)"
                helperText="Optional vertical or square banner optimized for smartphone displays."
              />

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Accessibility Alt Text *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.alt_text || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, alt_text: e.target.value })}
                  placeholder="Describe the image content for screen readers"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={editingItem.cta_label || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cta_label: e.target.value })}
                    placeholder="e.g. Explore Programs"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    CTA URL (Path or URL)
                  </label>
                  <input
                    type="text"
                    value={editingItem.cta_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cta_url: e.target.value })}
                    placeholder="e.g. /programs"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order ?? 0}
                    onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingItem.status || 'draft'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as 'draft' | 'published' | 'archived' })}
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
                  {saving ? 'Saving...' : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
