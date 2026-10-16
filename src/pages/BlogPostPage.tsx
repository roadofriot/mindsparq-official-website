import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import {
  getPostBySlug,
  getPublishedPosts,
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
  ShieldCheck,
  Clock,
  List,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  MessageCircle,
  SendHorizontal,
  Mail,
  ChevronRight
} from 'lucide-react';
import { sharePublicContent, getSocialShareUrls } from '../services/socialService';
import { updatePageSeo, generateArticleSchema, injectJsonLd, removeJsonLd } from '../utils/seo';

const FALLBACK_ARTICLES: Record<string, BlogPost> = {
  'why-abacus-training-enhances-mathematical-fluency': {
    id: 'fallback-blog-1',
    slug: 'why-abacus-training-enhances-mathematical-fluency',
    title: 'Why Abacus Training Enhances Mathematical Fluency in Early Childhood',
    excerpt: 'Discover how tactile bead calculation transitions into spatial mental arithmetic, fostering concentration and numerical confidence in young learners.',
    content: `Tactile calculation through the soroban abacus remains one of the most effective, research-backed methods to develop deep cognitive number sense in young children.

## 1. The Dual-Hemisphere Cognitive Advantage
When children manipulate physical abacus beads with both hands, both the left (logical, analytical, sequential) and right (spatial, holistic, intuitive) hemispheres of the brain are activated simultaneously. This bilateral stimulation accelerates neural path development during formative childhood years.

## 2. Transition from Physical Beads to Mental Imagery (Anzan)
The true breakthrough of abacus training occurs when children transition from physical bead movement to mental projection (Anzan). Learners visualize an internal imaginary soroban in their mind's eye. By manipulating virtual beads at rapid speed, they solve multi-digit arithmetic operations faster than typing into a conventional digital calculator.

## 3. Fostering Enduring Concentration & Discipline
Beyond arithmetic, abacus practice cultivates photographic memory, intense listening acumen, and sustained academic attention spans. Students learn to sit calmly, listen to rapid multi-number dictations, and maintain unwavering focus.

> "Mental arithmetic with the soroban abacus isn't just about math; it is about building neural agility, photographic memory, and unbreakable focus that transfers to every school subject."

At **MindSparQ Education & Technology**, our structured, tiered curriculum guides learners from basic tactile bead arithmetic through progressive milestones, eliminating math anxiety and replacing it with lifelong numerical enthusiasm.`,
    cover_image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
    category: 'Cognitive Skills',
    author_name: 'MindSparQ Academic Team',
    status: 'published',
    published_at: '2026-10-15T09:00:00Z',
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z'
  },
  'introducing-practical-ai-and-robotics-in-nepal-schools': {
    id: 'fallback-blog-2',
    slug: 'introducing-practical-ai-and-robotics-in-nepal-schools',
    title: 'Introducing Practical AI & Robotics in Nepal Schools: A Hands-on Roadmap',
    excerpt: 'How project-based learning and microcontroller experimentation demystify technology for young students.',
    content: `As technology accelerates globally, introducing robotics and artificial intelligence into primary and secondary schools in Nepal is no longer an optional luxury—it is an educational necessity.

## Moving From Passive Consumers to Active Creators
Too many young students experience technology purely as passive consumers through smartphone screens and video games. Hands-on robotics radically reverses this equation by challenging learners to design physical mechanisms, connect real electronic sensors, and write algorithmic instructions.

## The Sense • Think • Act Feedback Loop
Every autonomous robotic system operates on a fundamental loop:
1. **Sense:** Ultrasonic, infrared, and optical sensors perceive the physical environment.
2. **Think:** Microcontrollers like Arduino UNO R4 WiFi and ESP32 evaluate sensor data against programmed conditions.
3. **Act:** Actuators and motors respond physically to navigate obstacles or execute tasks.

## Turnkey School Integration in Nepal
MindSparQ partners directly with educational institutions to set up turnkey robotics innovation clubs. We provide hardware kits, age-tailored curriculums (Classes 3–8 Robotics Explorer & Young Robot Innovator cohorts), and certified mentor support.`,
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    category: 'Robotics & AI',
    author_name: 'MindSparQ Tech Team',
    status: 'published',
    published_at: '2026-10-12T14:30:00Z',
    created_at: '2026-10-12T14:30:00Z',
    updated_at: '2026-10-12T14:30:00Z'
  },
  'building-future-ready-skills-ai-coding-and-creativity-for-nepali-students': {
    id: 'fallback-blog-3',
    slug: 'building-future-ready-skills-ai-coding-and-creativity-for-nepali-students',
    title: 'Building Future-Ready Skills: AI, Coding and Creativity for Nepali Students',
    excerpt: 'Explore how technology, creativity, and problem-solving work together to prepare learners for the digital future.',
    content: `Preparing learners for tomorrow requires bridging timeless foundational thinking with emerging computational tools.

## The Synergy of Critical Reasoning & Applied AI
Artificial intelligence tools are transforming workplaces, but tools alone cannot replace human creativity, judgment, and systematic problem decomposition. At MindSparQ, our pedagogical methodology centers on cultivating resilient problem solvers who understand both how algorithms function and how to wield them ethically and responsibly.

## Local Relevance in Nepali Communities
From Butwal to national platforms, students equipped with computational thinking are already prototyping solutions for community challenges, agricultural sensors, and smart automation. By connecting students, teachers, and parents in a supportive learning triangle, we nurture confident innovators ready for regional and global opportunities.`,
    cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    category: 'Education',
    author_name: 'MindSparQ Team',
    status: 'published',
    published_at: '2026-10-10T11:00:00Z',
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-10T11:00:00Z'
  }
};

/**
 * Preprocess YouTube URLs into responsive embed iframe blocks
 */
function prepareArticleContent(content: string): string {
  if (!content) return '';

  // 1. Standalone [youtube:ID] format
  let processed = content.replace(
    /^\[youtube:([a-zA-Z0-9_-]{11})\]$/gim,
    '\n\n<div class="article-yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/$1" title="MindSparQ Video Player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>\n\n'
  );

  // 2. Standalone YouTube full URLs
  processed = processed.replace(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?$/gim,
    '\n\n<div class="article-yt-embed"><iframe src="https://www.youtube-nocookie.com/embed/$1" title="MindSparQ Video Player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>\n\n'
  );

  return processed;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
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

  // Copy feedback toast
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    setLoading(true);
    getPostBySlug(slug)
      .then(async (p) => {
        if (!mounted) return;
        const resolvedPost = p || FALLBACK_ARTICLES[slug] || null;
        setPost(resolvedPost);

        if (resolvedPost) {
          updatePageSeo({
            title: resolvedPost.seo_title || resolvedPost.title,
            description: resolvedPost.seo_description || resolvedPost.excerpt,
            canonicalPath: `/blog/${resolvedPost.slug}`,
            ogType: 'article',
            ogImage: resolvedPost.cover_image_url || undefined
          });

          injectJsonLd(generateArticleSchema(resolvedPost), 'blog-post-jsonld');

          // Fetch comments
          const cmts = await getCommentsForPost(resolvedPost.id);
          if (mounted) setComments(cmts);

          // Fetch like & bookmark status
          const likeInfo = await getPostLikeInfo(resolvedPost.id);
          if (mounted) {
            setLikeCount(likeInfo.count);
            setIsLiked(likeInfo.isLiked);
          }

          const bkmk = await getBookmarkStatus('blog_post', resolvedPost.id);
          if (mounted) setIsBookmarked(bkmk);
        }
      })
      .catch(() => {
        if (mounted) setPost(FALLBACK_ARTICLES[slug] || null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Fetch related articles for the sidebar
    getPublishedPosts()
      .then((published) => {
        if (!mounted) return;
        const pool = published.length > 0 ? published : Object.values(FALLBACK_ARTICLES);
        const filtered = pool.filter((item) => item.slug !== slug).slice(0, 3);
        setRelatedPosts(filtered);
      })
      .catch(() => {
        if (mounted) {
          const filtered = Object.values(FALLBACK_ARTICLES).filter((item) => item.slug !== slug).slice(0, 3);
          setRelatedPosts(filtered);
        }
      });

    return () => {
      mounted = false;
      removeJsonLd('blog-post-jsonld');
    };
  }, [slug, user]);

  // Markdown parsing + Table of contents extraction
  const { compiledHtml, headings } = useMemo(() => {
    if (!post?.content) return { compiledHtml: '', headings: [] };

    const prepared = prepareArticleContent(post.content);
    const rawHtml = marked.parse(prepared, { breaks: true, gfm: true }) as string;

    const tocList: TocItem[] = [];
    const usedSlugs = new Set<string>();

    const htmlWithAnchors = rawHtml.replace(/<h([23])>(.*?)<\/h\1>/gi, (_, levelStr, innerText) => {
      const level = parseInt(levelStr, 10);
      const cleanText = innerText.replace(/<[^>]*>/g, '').trim();
      let slugId = cleanText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      if (!slugId) slugId = `section-${tocList.length + 1}`;

      let uniqueSlug = slugId;
      let counter = 1;
      while (usedSlugs.has(uniqueSlug)) {
        uniqueSlug = `${slugId}-${counter++}`;
      }
      usedSlugs.add(uniqueSlug);

      tocList.push({ id: uniqueSlug, text: cleanText, level });
      return `<h${level} id="${uniqueSlug}">${innerText}</h${level}>`;
    });

    return { compiledHtml: htmlWithAnchors, headings: tocList };
  }, [post?.content]);

  // Reading time calculation (~200 words per minute)
  const readingTimeMinutes = useMemo(() => {
    if (!post?.content) return 1;
    const words = post.content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [post?.content]);

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like this post.');
      return;
    }
    if (!post || liking) return;

    setLiking(true);
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    const { isLiked: newLiked, error } = await toggleLike('blog_post', post.id);
    if (error) {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!post) return;
    const result = await sharePublicContent(post.title, post.excerpt, window.location.href);
    if (result.method === 'clipboard' && result.success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '3px solid var(--color-border)',
            borderTopColor: '#38bdf8',
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
          Back to All Articles
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
    <div style={{ paddingBottom: 'var(--space-16)', paddingTop: 'var(--space-6)' }}>
      {/* Breadcrumb / Back Navigation */}
      <div className="article-container-wide">
        <Link
          to="/blog"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-6)',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color var(--transition-fast)'
          }}
        >
          <ArrowLeft size={16} /> Back to All Articles
        </Link>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="article-container-wide">
        <div className="article-layout-grid">
          {/* ========================================================
              LEFT COLUMN: Main Article Content
              ======================================================== */}
          <main className="article-main-content">
            {/* Category, Read Time & Meta Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {post.category || 'Education'}
              </span>

              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> {readingTimeMinutes} min read
              </span>

              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} /> {pubDate}
              </span>
            </div>

            {/* Article Headline */}
            <h1
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                lineHeight: 1.25,
                marginBottom: 'var(--space-4)',
                letterSpacing: '-0.02em'
              }}
            >
              {post.title}
            </h1>

            {/* Author Credential */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-6)' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {post.author_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  MindSparQ Education & Technology Contributor
                </div>
              </div>
            </div>

            {/* Excerpt Lead Paragraph */}
            {post.excerpt && (
              <div
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderLeft: '4px solid #38bdf8',
                  marginBottom: 'var(--space-8)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.7,
                  color: 'var(--color-text-primary)',
                  fontStyle: 'normal',
                  fontWeight: 500
                }}
              >
                {post.excerpt}
              </div>
            )}

            {/* Cover Image */}
            {post.cover_image_url && (
              <div
                style={{
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  maxHeight: '480px',
                  marginBottom: 'var(--space-8)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}

            {/* Inline Quick Action Bar (Like, Bookmark, Quick Shares) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                marginBottom: 'var(--space-8)',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Like Button */}
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={liking}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: isLiked ? '#ef4444' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Heart size={15} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
                  <span>{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  type="button"
                  onClick={handleBookmark}
                  disabled={bookmarking}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: isBookmarked ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: isBookmarked ? '#38bdf8' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                  <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>
              </div>

              {/* Quick Share Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                  title="Share on Facebook"
                >
                  <span>Facebook</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: copiedLink ? '#10b981' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Copy direct article URL"
                >
                  {copiedLink ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Compiled Article HTML with Rich Prose Styling */}
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: compiledHtml }}
              style={{ marginBottom: 'var(--space-12)' }}
            />

            {/* Author Profile Footer Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                padding: '22px 24px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-10)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={28} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>
                  Article Author & Contributor
                </div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                  {post.author_name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                  Educator and curriculum innovator at MindSparQ Education & Technology. Committed to bringing practical AI, robotics, soroban mental math, and experiential coding to schools across Nepal.
                </p>
              </div>
            </div>

            {/* Multi-Network Share Banner */}
            <div
              style={{
                padding: '22px 24px',
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-12)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Share2 size={18} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Share this Educational Resource
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
                Help empower parents, students, and educators with forward-thinking STEM perspectives.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>

                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Facebook
                </a>

                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#0A66C2',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  LinkedIn
                </a>

                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  X / Twitter
                </a>

                <a
                  href={shareUrls.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#229ED9',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <SendHorizontal size={14} /> Telegram
                </a>

                <a
                  href={shareUrls.reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FF4500',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Reddit
                </a>

                <a
                  href={shareUrls.email}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#475569',
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={14} /> Email
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Share2 size={14} /> Share Menu
                </button>
              </div>
            </div>

            {/* Moderated Comments Section */}
            <section
              style={{
                borderTop: '2px solid var(--color-border)',
                paddingTop: 'var(--space-10)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                <MessageSquare size={22} style={{ color: '#38bdf8' }} />
                <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                  Community Discussion ({comments.filter((c) => c.status === 'approved' || c.user_id === user?.id).length})
                </h2>
              </div>

              {/* Comment Submission Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} style={{ marginBottom: 'var(--space-8)' }}>
                  <div
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      <ShieldCheck size={16} color="#10b981" />
                      <span>Comments are reviewed by moderation staff to ensure a supportive learning environment.</span>
                    </div>

                    <textarea
                      required
                      rows={3}
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      placeholder="Share your educational perspective, question, or feedback..."
                      className="input-field"
                      style={{ width: '100%', resize: 'vertical', marginBottom: 'var(--space-3)', padding: '12px' }}
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
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: '8px 18px', fontSize: 'var(--font-sm)' }}
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
                  <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', fontSize: '0.9375rem' }}>
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
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
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
                        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
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
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              Pending Review
                            </span>
                          )}
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {new Date(comment.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                        {comment.body}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </main>

          {/* ========================================================
              RIGHT COLUMN: Sticky Modern Magazine Sidebar
              ======================================================== */}
          <aside className="article-sidebar">
            {/* 1. Table of Contents Card */}
            {headings.length > 0 && (
              <div className="article-sidebar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                  <List size={16} style={{ color: '#38bdf8' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
                    Table of Contents (विषय सूची)
                  </h3>
                </div>
                <nav aria-label="Table of contents">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {headings.map((h, i) => (
                      <li key={i} style={{ paddingLeft: h.level === 3 ? '14px' : '0' }}>
                        <a
                          href={`#${h.id}`}
                          style={{
                            fontSize: '0.8125rem',
                            lineHeight: 1.5,
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '6px',
                            transition: 'color var(--transition-fast)'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                        >
                          <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.75rem', marginTop: '1px' }}>•</span>
                          <span>{h.text}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* 2. MindSparQ STEM Courses & Admissions Spotlight Card */}
            <div
              className="article-sidebar-card"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
                borderColor: 'rgba(56, 189, 248, 0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={16} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                  MindSparQ Programs
                </span>
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--color-text-primary)' }}>
                Empower Your Child with Future-Ready Skills
              </h3>

              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 14px' }}>
                Join Nepal's premier experiential learning academy for hands-on technology and cognitive mastery:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '0.8125rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <span style={{ fontSize: '1rem' }}>🤖</span>
                  <span><strong>Robotics & AI:</strong> Arduino, ESP32 & Sensors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <span style={{ fontSize: '1rem' }}>🧮</span>
                  <span><strong>Soroban Abacus:</strong> Spatial Mental Math</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
                  <span style={{ fontSize: '1rem' }}>💻</span>
                  <span><strong>Coding & Python:</strong> Games & Algorithmic Logic</span>
                </div>
              </div>

              <Link
                to="/courses"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  marginBottom: '10px',
                  transition: 'opacity var(--transition-fast)'
                }}
              >
                <span>Explore All Courses</span>
                <ChevronRight size={15} />
              </Link>

              <a
                href="https://api.whatsapp.com/send?phone=9779800000000&text=Namaste!%20I%20would%20like%20to%20learn%20more%20about%20MindSparQ%20courses."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(37, 211, 102, 0.12)',
                  border: '1px solid rgba(37, 211, 102, 0.3)',
                  color: '#22c55e',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <MessageCircle size={14} />
                <span>Talk to Admissions on WhatsApp</span>
              </a>
            </div>

            {/* 3. Comprehensive Social Share Hub Card */}
            <div className="article-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Share2 size={16} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
                  Share this Article
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#1877F2',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on Facebook"
                >
                  <span>Facebook</span>
                </a>

                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#0A66C2',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on LinkedIn"
                >
                  <span>LinkedIn</span>
                </a>

                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on X"
                >
                  <span>X / Twitter</span>
                </a>

                <a
                  href={shareUrls.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#229ED9',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on Telegram"
                >
                  <SendHorizontal size={13} />
                  <span>Telegram</span>
                </a>

                <a
                  href={shareUrls.reddit}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FF4500',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                  title="Share on Reddit"
                >
                  <span>Reddit</span>
                </a>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={shareUrls.email}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    justifyContent: 'center'
                  }}
                >
                  <Mail size={13} /> Email
                </a>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: copiedLink ? '#10b981' : 'var(--color-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                >
                  {copiedLink ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* 4. Related Educational Articles Card */}
            {relatedPosts.length > 0 && (
              <div className="article-sidebar-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                  <BookOpen size={16} style={{ color: '#38bdf8' }} />
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)' }}>
                    Related Articles
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.id}
                      to={`/blog/${item.slug}`}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'opacity var(--transition-fast)'
                      }}
                    >
                      {item.cover_image_url ? (
                        <div
                          style={{
                            width: '68px',
                            height: '52px',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: 'var(--color-surface-elevated)'
                          }}
                        >
                          <img
                            src={item.cover_image_url}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '68px',
                            height: '52px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <BookOpen size={18} />
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)',
                            lineHeight: 1.4,
                            marginBottom: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {item.title}
                        </div>
                        <span style={{ fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 600 }}>
                          {item.category || 'Educational Insight'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
