import React, { useState, useEffect } from 'react';
import { getAllComments, moderateComment, deleteComment } from '../../services/blogService';
import { BlogComment } from '../../types/database';
import { Check, X, ShieldAlert, Trash2, MessageSquare } from 'lucide-react';

export const AdminCommentsPage: React.FC = () => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchComments = (status: string) => {
    setLoading(true);
    getAllComments(status)
      .then((data) => setComments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments(filter);
  }, [filter]);

  const handleModerate = async (commentId: string, status: 'approved' | 'rejected' | 'spam') => {
    const { error } = await moderateComment(commentId, status);
    if (!error) {
      setActionMsg(`Comment marked as ${status}.`);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status } : c))
      );
      setTimeout(() => setActionMsg(null), 3000);
    } else {
      alert('Moderation error: ' + error.message);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    const { error } = await deleteComment(commentId);
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            Comment Moderation Queue
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
            Review learner comments before public display to safeguard community integrity and discussion quality.
          </p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['pending', 'approved', 'rejected', 'spam', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`btn ${filter === st ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            fontSize: 'var(--font-xs)',
            marginBottom: 'var(--space-4)'
          }}
        >
          {actionMsg}
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading moderation queue...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
            <MessageSquare size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No comments currently under the "{filter}" filter.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: 'var(--space-3)' }}>Author</th>
                <th style={{ padding: 'var(--space-3)' }}>Comment Text</th>
                <th style={{ padding: 'var(--space-3)' }}>Date</th>
                <th style={{ padding: 'var(--space-3)' }}>Status</th>
                <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Moderation Action</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {comment.author_name}
                  </td>
                  <td style={{ padding: 'var(--space-3)', maxWidth: '400px' }}>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text)', lineHeight: 1.5 }}>
                      {comment.body}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--space-3)' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor:
                          comment.status === 'approved'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : comment.status === 'pending'
                            ? 'rgba(245, 158, 11, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                        color:
                          comment.status === 'approved'
                            ? '#10b981'
                            : comment.status === 'pending'
                            ? '#d97706'
                            : '#ef4444'
                      }}
                    >
                      {comment.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                      {comment.status !== 'approved' && (
                        <button
                          onClick={() => handleModerate(comment.id, 'approved')}
                          title="Approve Comment"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={14} />
                        </button>
                      )}

                      {comment.status !== 'rejected' && (
                        <button
                          onClick={() => handleModerate(comment.id, 'rejected')}
                          title="Reject Comment"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}

                      {comment.status !== 'spam' && (
                        <button
                          onClick={() => handleModerate(comment.id, 'spam')}
                          title="Flag as Spam"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#d97706',
                            cursor: 'pointer'
                          }}
                        >
                          <ShieldAlert size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(comment.id)}
                        title="Delete permanently"
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          background: 'none',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
