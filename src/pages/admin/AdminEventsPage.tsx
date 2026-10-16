import React, { useState, useEffect } from 'react';
import { getAllEvents, saveEvent, deleteEvent } from '../../services/eventService';
import { Event } from '../../types/database';
import { Plus, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchEvents = () => {
    setLoading(true);
    getAllEvents()
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent({
      slug: '',
      title: '',
      summary: '',
      description: '',
      cover_image_url: '',
      location_text: 'Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal',
      starts_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16),
      ends_at: new Date(Date.now() + 7 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString().slice(0, 16),
      registration_url: '',
      status: 'draft'
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: Event) => {
    setEditingEvent({
      ...ev,
      starts_at: new Date(ev.starts_at).toISOString().slice(0, 16),
      ends_at: ev.ends_at ? new Date(ev.ends_at).toISOString().slice(0, 16) : ''
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    const { error } = await deleteEvent(id);
    if (!error) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    if (!editingEvent.slug || !/^[a-z0-9-]+$/.test(editingEvent.slug)) {
      setSaveError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }
    if (!editingEvent.title?.trim()) {
      setSaveError('Event title is required.');
      return;
    }
    if (!editingEvent.location_text?.trim()) {
      setSaveError('Location / venue is required.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const { data, error } = await saveEvent({
      ...editingEvent,
      starts_at: new Date(editingEvent.starts_at!).toISOString(),
      ends_at: editingEvent.ends_at ? new Date(editingEvent.ends_at).toISOString() : null
    });

    if (error) {
      setSaveError(error.message);
    } else if (data) {
      setIsModalOpen(false);
      fetchEvents();
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Events, Workshops & Exhibitions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Schedule academic competitions, community demonstrations, and robotics workshops.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Schedule Event
        </button>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              No events scheduled in database.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-secondary">
              Schedule First Event
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Event Title & Slug</th>
                <th style={{ padding: 'var(--space-3)' }}>Date & Venue</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{ev.title}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>/{ev.slug}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                    <div style={{ fontWeight: 600 }}>{new Date(ev.starts_at).toLocaleString()}</div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>{ev.location_text}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 600,
                        backgroundColor:
                          ev.status === 'published'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        color: ev.status === 'published' ? '#10b981' : '#d97706',
                        textTransform: 'capitalize'
                      }}
                    >
                      {ev.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ev.id, ev.title)}
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
      {isModalOpen && editingEvent && (
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
              {editingEvent.id ? 'Edit Event' : 'Schedule New Event'}
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
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = !editingEvent.id
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                        : editingEvent.slug;
                      setEditingEvent({ ...editingEvent, title, slug });
                    }}
                    placeholder="e.g. Regional STEM Fair 2026"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.slug || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, slug: e.target.value })}
                    placeholder="e.g. regional-stem-fair"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={editingEvent.starts_at || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, starts_at: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    End Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={editingEvent.ends_at || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, ends_at: e.target.value })}
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Location / Venue Address *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.location_text || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location_text: e.target.value })}
                  placeholder="e.g. Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal"
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Registration URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingEvent.registration_url || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, registration_url: e.target.value })}
                    placeholder="https://..."
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingEvent.status || 'draft'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Event Promotional Poster / Cover Image (Optional)"
                value={editingEvent.cover_image_url || ''}
                onChange={(url) => setEditingEvent({ ...editingEvent, cover_image_url: url })}
                altTextDefault={editingEvent.title || 'Event Cover'}
                placeholder="Or paste external event poster URL (https://...)..."
                helperText="Upload event promotional graphics/banner from your desktop or paste a direct image URL"
              />

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingEvent.summary || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, summary: e.target.value })}
                  placeholder="Brief summary for event cards..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="Full schedule, agenda, speakers, instructions..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
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
                  {saving ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
