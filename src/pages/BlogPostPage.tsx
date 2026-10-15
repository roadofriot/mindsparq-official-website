import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getPostBySlug,
  getCommentsForPost,
  submitComment,
  getPostLikeInfo,
  toggleLike,
  getBookmarkStatus,
  toggleBookmark
} from '../services/blogService';
import { BlogPost, BlogComment } from '../types/database';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  User,
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { sharePublicContent, getSocialShareUrls } from '../services/socialService';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  // Like & Bookmark state
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // Comment submission form
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    setLoading(true);
    getPostBySlug(slug)
      .then(async (p) => {
        if (!mounted || !p) return;
        setPost(p);

        // Fetch comments
        const cmts = await getCommentsForPost(p.id);
        if (mounted) setComments(cmts);

        // Fetch like & bookmark status
        const likeInfo = await getPostLikeInfo(p.id);
        if (mounted) {
          setLikeCount(likeInfo.count);
          setIsLiked(likeInfo.isLiked);
        }

        const bkmk = await getBookmarkStatus('blog_post', p.id);
        if (mounted) setIsBookmarked(bkmk);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, user]);

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like this post.');
      return;
    }
    if (!post || liking) return;

    setLiking(true);
    // Optimistic toggle
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    const { isLiked: newLiked, error } = await toggleLike('blog_post', post.id);
    if (error) {
      // Revert if error
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    } else {
      setIsLiked(newLiked);
    }
    setLiking(false);
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('Please sign in to bookmark this post.');
      return;
    }
    if (!post || bookmarking) return;

    setBookmarking(true);
    const prevBkmk = isBookmarked;
    setIsBookmarked(!prevBkmk);

    const { isBookmarked: newBkmk, error } = await toggleBookmark('blog_post', post.id);
    if (error) {
      setIsBookmarked(prevBkmk);
    } else {
      setIsBookmarked(newBkmk);
    }
    setBookmarking(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;

    setCommentError(null);
    setCommentSuccess(null);
    setSubmittingComment(true);

    const authorName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Learner';
    const { data, error } = await submitComment(post.id, authorName, commentBody);

    if (error) {
      setCommentError(error.message);
    } else if (data) {
      setCommentSuccess('Your comment has been submitted and is currently pending moderator approval.');
      setCommentBody('');
      setComments((prev) => [...prev, data]);
    }
    setSubmittingComment(false);
  };

  const handleShare = async () => {
    if (!post) return;
    const result = await sharePublicContent(post.title, post.excerpt, window.location.href);
    if (result.method === 'clipboard' && result.success) {
      alert('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-primary-600)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Article Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          The requested article does not exist or may have been unlisted.
        </p>
        <Link to="/blog" className="btn btn-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  const shareUrls = getSocialShareUrls(window.location.href, post.title);
  const pubDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recent';

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Top back link */}
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Link
          to="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <ArrowLeft size={16} /> Back to All Articles
        </Link>
      </div>

      <article className="container" style={{ maxWidth: '840px' }}>
        {/* Category & Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700
            }}
          >
            {post.category}
          </span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {pubDate}
          </span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User size={14} /> {post.author_name}
          </span>
        </div>

        <h1
          style={{
            fontSize: 'var(--font-4xl)',
            fontWeight: 800,
            color: 'var(--color-text)',
            lineHeight: 1.25,
            marginBottom: 'var(--space-6)'
          }}
        >
          {post.title}
        </h1>

        {/* Cover image */}
        {post.cover_image_url && (
          <div
            style={{
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              height: '380px',
              marginBottom: 'var(--space-8)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Social Actions Bar (Likes, Bookmarks, Share) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={liking}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                color: isLiked ? '#ef4444' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'var(--font-sm)'
              }}
            >
              <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
              <span>{likeCount}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: isBookmarked ? 'var(--color-primary-50)' : 'transparent',
                color: isBookmarked ? 'var(--color-primary-600)' : 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'var(--font-sm)'
              }}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>
          </div>

          {/* Share links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Share2 size={14} /> Share
            </button>
            <a
              href={shareUrls.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--font-xs)' }}
            >
              WhatsApp
            </a>
            <a
              href={shareUrls.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--font-xs)' }}
            >
              Facebook
            </a>
          </div>
        </div>

        {/* Article Body */}
        <div
          style={{
            fontSize: 'var(--font-lg)',
            lineHeight: 1.85,
            color: 'var(--color-text)',
            whiteSpace: 'pre-line',
            marginBottom: 'var(--space-12)'
          }}
        >
          {post.content}
        </div>

        {/* Moderated Comments Section */}
        <section
          style={{
            borderTop: '2px solid var(--color-border)',
            paddingTop: 'var(--space-10)',
            marginTop: 'var(--space-12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            <MessageSquare size={22} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              Community Discussion ({comments.filter((c) => c.status === 'approved' || c.user_id === user?.id).length})
            </h2>
          </div>

          {/* Comment Submission Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: 'var(--space-8)' }}>
              <div
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>Comments are reviewed by moderation staff to ensure a safe learning environment.</span>
                </div>

                <textarea
                  required
                  rows={3}
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Share your educational perspective, question, or feedback..."
                  className="input-field"
                  style={{ width: '100%', resize: 'vertical', marginBottom: 'var(--space-3)' }}
                />

                {commentError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#ef4444', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-2)' }}>
                    <AlertCircle size={14} /> {commentError}
                  </div>
                )}

                {commentSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#10b981', fontSize: 'var(--font-xs)', marginBottom: 'var(--space-2)' }}>
                    <CheckCircle2 size={14} /> {commentSuccess}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                    {commentBody.length} / 2000 characters
                  </span>
                  <button
                    type="submit"
                    disabled={submittingComment || commentBody.trim().length < 2}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-sm)' }}
                  >
                    <Send size={14} />
                    <span>{submittingComment ? 'Submitting...' : 'Post Comment'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
                marginBottom: 'var(--space-8)'
              }}
            >
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                Sign in to participate in the learning community and submit comments.
              </p>
              <Link to={`/auth?returnUrl=/blog/${post.slug}`} className="btn btn-primary">
                Sign In to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
                No comments posted yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-sm)', color: 'var(--color-text)' }}>
                      {comment.author_name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {comment.status === 'pending' && (
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: '#d97706',
                            fontSize: 'var(--font-xs)',
                            fontWeight: 600
                          }}
                        >
                          Pending Review
                        </span>
                      )}
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
                        {new Date(comment.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {comment.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </article>
    </div>
  );
};
