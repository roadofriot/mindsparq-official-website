import React, { useState, useEffect } from 'react';
import { getAllPosts, savePost, deletePost } from '../../services/blogService';
import { BlogPost } from '../../types/database';
import { Plus, Edit2, Trash2, FileText, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    getAllPosts()
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Education',
      cover_image_url: '',
      status: 'draft'
    });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${title}"?`)) return;
    const { error } = await deletePost(id);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('Delete failed: ' + error.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.slug || !/^[a-z0-9-]+$/.test(editingPost.slug)) {
      setSaveError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }
    if (!editingPost.title?.trim()) {
      setSaveError('Article title is required.');
      return;
    }
    if (!editingPost.excerpt?.trim()) {
      setSaveError('Excerpt is required.');
      return;
    }
    if (!editingPost.content?.trim()) {
      setSaveError('Article content is required.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const { data, error } = await savePost(editingPost);

    if (error) {
      setSaveError(error.message);
    } else if (data) {
      setIsModalOpen(false);
      fetchPosts();
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Blog & Educational Articles
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Draft, review, and publish educational insights, STEM news, and pedagogy articles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={16} /> Draft Article
        </button>
      </div>

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              No blog articles found. The public blog is showing the initial seed article.
            </p>
            <button onClick={handleOpenCreate} className="btn btn-secondary">
              Create First Article
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Title & Slug</th>
                <th style={{ padding: 'var(--space-3)' }}>Category</th>
                <th style={{ padding: 'var(--space-3)' }}>Author</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{post.title}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>/{post.slug}</div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                    {post.category}
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                    {post.author_name}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-xs)',
                        fontWeight: 600,
                        backgroundColor:
                          post.status === 'published'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : post.status === 'review'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                        color:
                          post.status === 'published'
                            ? '#10b981'
                            : post.status === 'review'
                            ? '#3b82f6'
                            : '#d97706',
                        textTransform: 'capitalize'
                      }}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      {post.status === 'published' && (
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          title="View Live Article"
                          style={{ color: 'var(--color-text-secondary)', padding: '4px' }}
                        >
                          <Eye size={16} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleOpenEdit(post)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary-600)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
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
      {isModalOpen && editingPost && (
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
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>
              {editingPost.id ? 'Edit Article' : 'Draft New Article'}
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
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.title || ''}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = !editingPost.id
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                        : editingPost.slug;
                      setEditingPost({ ...editingPost, title, slug });
                    }}
                    placeholder="e.g. Cognitive Benefits of Early Mental Math"
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
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="e.g. cognitive-benefits-mental-math"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingPost.category || 'Education'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    placeholder="e.g. Robotics & AI, Cognitive Skills"
                    className="input-field"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={editingPost.status || 'draft'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    className="input-field"
                    style={{ width: '100%' }}
                  >
                    <option value="draft">Draft (Private)</option>
                    <option value="review">Under Review</option>
                    <option value="published">Published (Public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={editingPost.cover_image_url || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, cover_image_url: e.target.value })}
                  placeholder="https://..."
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Excerpt / Summary *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Brief synopsis for blog listing cards..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-sm)', fontWeight: 600, marginBottom: '4px' }}>
                  Article Content *
                </label>
                <textarea
                  required
                  rows={8}
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="Write the complete article content..."
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
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
