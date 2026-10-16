import React, { useState, useEffect } from 'react';
import { getAllPosts, savePost, deletePost, updatePostStatus } from '../../services/blogService';
import { BlogPost } from '../../types/database';
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  User as UserIcon,
  Image as ImageIcon,
  Video,
  Heading,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadMedia } from '../../services/mediaService';
import { extractYouTubeVideoId } from '../../services/courseService';
import { ImageUploadField } from '../../components/admin/ImageUploadField';

export const AdminBlogPage: React.FC = () => {
  const { user, isOwner, isAdmin, isSuperAdmin, hasPermission } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);
  const [mediaNotice, setMediaNotice] = useState<string | null>(null);

  const canPublish = isSuperAdmin || isOwner || isAdmin || hasPermission('content.publish');

  const handleUploadInlineImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !editingPost) return;
    const file = e.target.files[0];
    setUploadingInline(true);
    setMediaNotice(null);
    const { data, error } = await uploadMedia(file, 'Article visual illustration', undefined, 'public');
    if (error) {
      setMediaNotice(`Image upload failed: ${error.message}`);
    } else if (data?.storage_path) {
      const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const mdSnippet = `\n\n![${cleanAlt}](${data.storage_path})\n\n`;
      setEditingPost({ ...editingPost, content: (editingPost.content || '') + mdSnippet });
      setMediaNotice('Image inserted into article content!');
    }
    setUploadingInline(false);
  };

  const handleInsertYouTube = () => {
    if (!editingPost) return;
    const input = window.prompt('Enter YouTube video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...):');
    if (!input) return;
    const videoId = extractYouTubeVideoId(input);
    if (!videoId) {
      alert('Invalid YouTube URL. Please provide a standard YouTube video link.');
      return;
    }
    const ytSnippet = `\n\nhttps://www.youtube.com/watch?v=${videoId}\n\n`;
    setEditingPost({ ...editingPost, content: (editingPost.content || '') + ytSnippet });
    setMediaNotice('YouTube video embed inserted into article!');
  };

  const handleInsertHeading = (level: 2 | 3) => {
    if (!editingPost) return;
    const hashes = '#'.repeat(level);
    const snippet = `\n\n${hashes} Section Title\n\n`;
    setEditingPost({ ...editingPost, content: (editingPost.content || '') + snippet });
  };

  const fetchPosts = () => {
    setLoading(true);
    getAllPosts()
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingPost({
      slug: '',
      title: '',
      excerpt: '',
      content: '',
      category: 'Education',
      cover_image_url: '',
      author_name: user?.user_metadata?.full_name || 'MindSparQ Author',
      author_id: user?.id || null,
      status: 'draft',
      seo_title: '',
      seo_description: ''
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
    if (!canPublish) {
      showNotification('Permission denied: You need administrative publishing clearance to delete articles.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete post "${title}"? This action is permanent.`)) return;

    const { error } = await deletePost(id);
    if (!error) {
      showNotification(`Article "${title}" deleted successfully.`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      showNotification(`Delete failed: ${error.message}`, 'error');
    }
  };

  const handleQuickStatus = async (post: BlogPost, newStatus: 'draft' | 'review' | 'published' | 'archived') => {
    if (newStatus === 'published' && !canPublish) {
      showNotification('Permission denied: Administrative authorization is required to publish articles.', 'error');
      return;
    }

    const { data, error } = await updatePostStatus(post.id, newStatus);
    if (!error && data) {
      showNotification(`Article "${post.title}" moved to ${newStatus}.`);
      fetchPosts();
    } else {
      showNotification(`Status update failed: ${error?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (!editingPost) return;
    const isNew = !editingPost.id;
    const updates: Partial<BlogPost> = { title: newTitle };

    // Auto-generate slug for new posts if not manually customized
    if (isNew) {
      const suggestedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      updates.slug = suggestedSlug;
    }
    setEditingPost({ ...editingPost, ...updates });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    if (!editingPost.slug || !/^[a-z0-9-]+$/.test(editingPost.slug)) {
      setSaveError('Slug must contain only lowercase letters, numbers, and hyphens (e.g. mental-math-foundations).');
      return;
    }
    if (!editingPost.title?.trim()) {
      setSaveError('Article title is required.');
      return;
    }
    if (!editingPost.excerpt?.trim()) {
      setSaveError('Excerpt / summary is required.');
      return;
    }
    if (!editingPost.content?.trim()) {
      setSaveError('Article body content is required.');
      return;
    }

    // Role check: non-publishers cannot save directly as published
    if (editingPost.status === 'published' && !canPublish) {
      setSaveError('Your role does not permit publishing directly. Please select "Review" or "Draft" to submit for approval.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    const { data, error } = await savePost(editingPost);

    if (error) {
      setSaveError(error.message);
    } else if (data) {
      showNotification(`Article "${data.title}" saved successfully as ${data.status}.`);
      setIsModalOpen(false);
      fetchPosts();
    }
    setSaving(false);
  };

  // Metrics
  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const reviewCount = posts.filter((p) => p.status === 'review').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;
  const archivedCount = posts.filter((p) => p.status === 'archived').length;

  // Filtered List
  const filteredPosts = posts.filter((p) => {
    const titleMatch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = p.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const slugMatch = p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || authorMatch || slugMatch;

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'My Posts'
        ? p.author_id === user?.id
        : p.status === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === 'All'
        ? true
        : p.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Published' };
      case 'review':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'In Review' };
      case 'archived':
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Archived' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', label: 'Draft' };
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                color: '#c084fc'
              }}
            >
              Multi-Author CMS
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Editorial Workflow
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px' }}>
            Blog & Educational Articles
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>
            Author, review, and publish pedagogical insights, computational thinking essays, and STEM news.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
          }}
        >
          <Plus size={16} />
          <span>New Article</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}
      >
        <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Articles</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '4px' }}>{totalCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase' }}>Published</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>{publishedCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase' }}>In Review</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{reviewCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase' }}>Drafts</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>{draftCount}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Archived</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-muted)', marginTop: '4px' }}>{archivedCount}</div>
        </div>
      </div>

      {/* Notification Banner */}
      {actionMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: actionMsg.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${actionMsg.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: actionMsg.type === 'success' ? '#22c55e' : '#ef4444',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search articles by title, author, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 12px 0 40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'My Posts', 'Published', 'Review', 'Draft', 'Archived'].map((status) => {
            const isSelected = statusFilter.toLowerCase() === status.toLowerCase();
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: isSelected ? '#2563eb' : 'var(--color-border)',
                  backgroundColor: isSelected ? '#2563eb' : 'var(--color-surface-elevated)',
                  color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {status === 'Review' ? 'In Review' : status}
              </button>
            );
          })}
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            height: '38px',
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '0.8125rem',
            outline: 'none'
          }}
        >
          <option value="All">All Categories</option>
          <option value="Education">Education</option>
          <option value="Cognitive Skills">Cognitive Skills</option>
          <option value="Robotics & AI">Robotics & AI</option>
          <option value="Technology">Technology</option>
        </select>
      </div>

      {/* Posts Table */}
      <div
        className="card"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading educational articles...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <FileText size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-3)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>No articles match your criteria</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: '0 0 var(--space-4)' }}>
              Try refining your query, or draft a new article for publication.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Draft New Article
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-elevated)' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Article</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Author</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Updated</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const statusInfo = getStatusBadge(post.status);
                  const isAuthor = post.author_id === user?.id;

                  return (
                    <tr
                      key={post.id}
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        transition: 'background-color var(--transition-fast)'
                      }}
                    >
                      {/* Title & Slug */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{post.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          /{post.slug}
                        </div>
                      </td>

                      {/* Author */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserIcon size={14} style={{ color: 'var(--color-text-muted)' }} />
                          <span style={{ fontWeight: 500, color: 'var(--color-text-primary)', fontSize: '0.8125rem' }}>
                            {post.author_name}
                          </span>
                          {isAuthor && (
                            <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 600 }}>
                              (You)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}
                        >
                          {post.category || 'Education'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            fontSize: '0.6875rem',
                            fontWeight: 600
                          }}
                        >
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Updated Date */}
                      <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                        {post.updated_at ? new Date(post.updated_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          {/* Preview Link */}
                          <Link
                            to={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Preview public view"
                            style={{
                              padding: '5px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {/* Quick Status Workflow Buttons */}
                          {post.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(post, 'review')}
                              title="Submit for review"
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#f59e0b',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Submit
                            </button>
                          )}

                          {canPublish && post.status !== 'published' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(post, 'published')}
                              title="Publish article immediately"
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                color: '#22c55e',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Publish
                            </button>
                          )}

                          {canPublish && post.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(post, 'draft')}
                              title="Unpublish to draft"
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                              }}
                            >
                              Unpublish
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(post)}
                            title="Edit article"
                            style={{
                              padding: '5px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-secondary)',
                              cursor: 'pointer'
                            }}
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete */}
                          {canPublish && (
                            <button
                              type="button"
                              onClick={() => handleDelete(post.id, post.title)}
                              title="Delete article"
                              style={{
                                padding: '5px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
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

      {/* Editor Modal */}
      {isModalOpen && editingPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-2xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>
                  {editingPost.id ? 'Edit Educational Article' : 'Draft New Educational Article'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Multi-Author Publishing Engine • Server-Validated Schema
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {saveError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.875rem',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* Title */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Visual-Auditory-Kinesthetic (VAK) Methods in Butwal Classrooms"
                  value={editingPost.title || ''}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Slug & Author Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    URL Slug * (lowercase & hyphens)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="vak-methods-butwal"
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value.toLowerCase() })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Credited Author Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samay Budhathoki Chhetri"
                    value={editingPost.author_name || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, author_name: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Category & Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={editingPost.category || 'Education'}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="Education">Education</option>
                    <option value="Cognitive Skills">Cognitive Skills</option>
                    <option value="Robotics & AI">Robotics & AI</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Workflow Status
                  </label>
                  <select
                    value={editingPost.status || 'draft'}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <option value="draft">Draft (Private to author)</option>
                    <option value="review">Submit for Review</option>
                    {canPublish && <option value="published">Published (Publicly live)</option>}
                    {canPublish && <option value="archived">Archived (Unlisted)</option>}
                  </select>
                </div>
              </div>

              {/* Excerpt */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Excerpt / Brief Summary * (Shows in listings & preview cards)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {(editingPost.excerpt || '').length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="Provide a concise 1-3 sentence overview of the article for preview cards, social shares, and search engines..."
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '125px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                  }}
                />
              </div>

              {/* Media Notice banner */}
              {mediaNotice && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#0284c7',
                    fontSize: '0.8125rem',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{mediaNotice}</span>
                  <button
                    type="button"
                    onClick={() => setMediaNotice(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Main Content with Media Toolbar */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, margin: 0 }}>
                    Main Article Content * (Markdown, Images & Videos)
                  </label>

                  {/* Formatting Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Inline Image Upload */}
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: uploadingInline ? 'not-allowed' : 'pointer'
                      }}
                      title="Upload an image and insert into the article"
                    >
                      {uploadingInline ? <Loader2 size={13} className="spin" /> : <ImageIcon size={13} />}
                      <span>{uploadingInline ? 'Uploading...' : 'Insert Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadInlineImage}
                        disabled={uploadingInline}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {/* YouTube Video Insert */}
                    <button
                      type="button"
                      onClick={handleInsertYouTube}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Insert a YouTube video player into the article"
                    >
                      <Video size={13} />
                      <span>Insert YouTube</span>
                    </button>

                    {/* Subheading Insert */}
                    <button
                      type="button"
                      onClick={() => handleInsertHeading(3)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      title="Insert a section heading"
                    >
                      <Heading size={13} />
                      <span>Heading</span>
                    </button>
                  </div>
                </div>

                <textarea
                  required
                  rows={8}
                  placeholder="Write the full article content here. You can use the buttons above to insert images and YouTube videos..."
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Cover Image Section */}
              <ImageUploadField
                label="Article Cover Image (Optional)"
                value={editingPost.cover_image_url || ''}
                onChange={(url) => setEditingPost({ ...editingPost, cover_image_url: url })}
                altTextDefault={editingPost.title || 'Article Cover'}
                placeholder="Or paste external image URL (e.g. Unsplash, Google direct link)..."
                helperText="Upload cover image directly from your desktop or enter a direct image URL"
              />

              {/* SEO Title & Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    SEO Meta Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Custom page title for search engines"
                    value={editingPost.seo_title || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, seo_title: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    SEO Meta Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Search snippet summary"
                    value={editingPost.seo_description || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, seo_description: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                  }}
                >
                  {saving ? 'Saving...' : editingPost.id ? 'Save Changes' : 'Create Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
