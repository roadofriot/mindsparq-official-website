import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPosts } from '../services/blogService';
import { BlogPost } from '../types/database';
import { 
  BookOpen, 
  Calendar, 
  User, 
  Search, 
  Clock, 
  ArrowRight, 
  Cpu, 
  Brain, 
  GraduationCap, 
  Lightbulb, 
  Code2, 
  Atom,
  Sparkles
} from 'lucide-react';
import { updatePageSeo } from '../utils/seo';

interface PostWithExtra extends BlogPost {
  read_time?: string;
}

const FALLBACK_POSTS: PostWithExtra[] = [
  {
    id: 'fallback-blog-1',
    slug: 'why-abacus-training-enhances-mathematical-fluency',
    title: 'Why Abacus Training Enhances Mathematical Fluency in Early Childhood',
    excerpt: 'Discover how tactile bead calculation transitions into spatial mental arithmetic, fostering concentration and numerical confidence in young learners.',
    content: 'Tactile calculation through the soroban abacus remains one of the most effective methods to develop cognitive number sense...',
    cover_image_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    category: 'Cognitive Skills',
    author_name: 'MindSparQ Academic Team',
    status: 'published',
    published_at: '2026-10-15T09:00:00Z',
    read_time: '5 min read',
    created_at: '2026-10-15T09:00:00Z',
    updated_at: '2026-10-15T09:00:00Z'
  },
  {
    id: 'fallback-blog-2',
    slug: 'introducing-practical-ai-and-robotics-in-nepal-schools',
    title: 'Introducing Practical AI & Robotics in Nepal Schools: A Hands-on Roadmap',
    excerpt: 'How project-based learning and microcontroller experimentation demystify technology for young students.',
    content: 'Hands-on robotics transforms passive screen consumption into active engineering and computational logic...',
    cover_image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    category: 'Robotics & AI',
    author_name: 'MindSparQ Tech Team',
    status: 'published',
    published_at: '2026-10-12T14:30:00Z',
    read_time: '7 min read',
    created_at: '2026-10-12T14:30:00Z',
    updated_at: '2026-10-12T14:30:00Z'
  },
  {
    id: 'fallback-blog-3',
    slug: 'building-future-ready-skills-ai-coding-and-creativity-for-nepali-students',
    title: 'Building Future-Ready Skills: AI, Coding and Creativity for Nepali Students',
    excerpt: 'Explore how technology, creativity, and problem-solving work together to prepare learners for the digital future.',
    content: 'Preparing learners for an automated world requires nurturing creative reasoning, logic, and ethical technology orientation...',
    cover_image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    category: 'Education',
    author_name: 'MindSparQ Team',
    status: 'published',
    published_at: '2026-10-10T11:00:00Z',
    read_time: '6 min read',
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-10T11:00:00Z'
  }
];

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<PostWithExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    updatePageSeo({
      title: 'Educational Articles & Pedagogical Insights',
      description: 'Pedagogical insights, STEM curriculum updates, and student achievements from MindSparQ in Nepal.',
      canonicalPath: '/blog',
      ogType: 'website'
    });

    let mounted = true;
    getPublishedPosts()
      .then((data) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          // Merge custom database posts with fallback defaults for a rich display
          const combined = [
            ...data,
            ...FALLBACK_POSTS.filter((f) => !data.some((d) => d.slug === f.slug))
          ];
          setPosts(combined);
        } else {
          setPosts(FALLBACK_POSTS);
        }
      })
      .catch(() => {
        if (mounted) setPosts(FALLBACK_POSTS);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const standardCategories = ['All', 'Cognitive Skills', 'Robotics & AI', 'Education', 'Technology'];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      post.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const getCategoryBadgeStyle = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'cognitive skills':
        return {
          icon: <Brain size={13} />,
          bg: 'rgba(37, 99, 235, 0.85)',
          border: '1px solid rgba(96, 165, 250, 0.4)'
        };
      case 'robotics & ai':
        return {
          icon: <Cpu size={13} />,
          bg: 'rgba(147, 51, 234, 0.85)',
          border: '1px solid rgba(192, 132, 252, 0.4)'
        };
      case 'education':
        return {
          icon: <GraduationCap size={13} />,
          bg: 'rgba(13, 148, 136, 0.85)',
          border: '1px solid rgba(45, 212, 191, 0.4)'
        };
      default:
        return {
          icon: <BookOpen size={13} />,
          bg: 'rgba(59, 130, 246, 0.85)',
          border: '1px solid rgba(147, 197, 253, 0.4)'
        };
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', paddingBottom: 'var(--space-20)', minHeight: '100vh' }}>
      {/* Hero Banner with glowing Cyber-Brain and Educational visual */}
      <section
        style={{
          position: 'relative',
          padding: 'var(--space-16) 0 var(--space-12)',
          background: 'radial-gradient(ellipse at 80% 30%, rgba(56, 189, 248, 0.12) 0%, rgba(139, 92, 246, 0.08) 35%, transparent 70%)',
          overflow: 'hidden',
          borderBottom: '1px solid var(--color-border)'
        }}
      >
        <div className="container">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: 'var(--space-8)', 
              alignItems: 'center' 
            }}
            className="blog-hero-grid"
          >
            {/* Left Hero Content */}
            <div style={{ maxWidth: '640px' }}>
              {/* Pill Eyebrow */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(14, 165, 233, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 'var(--space-4)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <BookOpen size={13} />
                <span>INSIGHTS & EDUCATION</span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: 'var(--space-4)',
                  color: 'var(--color-text-primary)'
                }}
              >
                MindSparQ Blog & <br />
                <span
                  style={{
                    background: 'linear-gradient(135deg, #38bdf8 0%, #c084fc 45%, #ec4899 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
                  }}
                >
                  Knowledge Base
                </span>
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.65,
                  margin: 0
                }}
              >
                Pedagogical insights, computational thinking methodologies, abacus mastery techniques, and educational tech perspectives from Nepal.
              </p>
            </div>

            {/* Right Hero Visual Art (Matching screenshot glowing brain & learning icons) */}
            <div 
              className="blog-hero-art"
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* Outer decorative glowing ring */}
              <div
                style={{
                  position: 'relative',
                  width: '320px',
                  height: '240px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 30px rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  overflow: 'hidden'
                }}
              >
                {/* Background glow radial */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    width: '160px',
                    height: '160px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Glowing Brain SVG Representation */}
                <div style={{ position: 'relative', zIndex: 2, marginBottom: '14px' }}>
                  <svg width="84" height="84" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.8))' }}>
                    <path
                      d="M9.5 2C7 2 5 4 5 6.5C5 7.1 5.1 7.7 5.4 8.2C3.4 9 2 11 2 13.5C2 16.5 4.5 19 7.5 19C8.2 19 8.9 18.9 9.5 18.6"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M14.5 2C17 2 19 4 19 6.5C19 7.1 18.9 7.7 18.6 8.2C20.6 9 22 11 22 13.5C22 16.5 19.5 19 16.5 19C15.8 19 15.1 18.9 14.5 18.6"
                      stroke="#c084fc"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.5 2V22M14.5 2V22"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      strokeDasharray="2 3"
                    />
                    <path
                      d="M9.5 6C11 6 12 7 12 8M14.5 6C13 6 12 7 12 8M12 8V16M9.5 14C11 14 12 15 12 16M14.5 14C13 14 12 15 12 16"
                      stroke="#ec4899"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>

                {/* Floating Micro-Badges */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '24px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)'
                  }}
                >
                  <Lightbulb size={16} />
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(192, 132, 252, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    boxShadow: '0 0 12px rgba(192, 132, 252, 0.5)'
                  }}
                >
                  <GraduationCap size={16} />
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '28px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa'
                  }}
                >
                  <Code2 size={15} />
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '28px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ec4899'
                  }}
                >
                  <Atom size={15} />
                </div>

                {/* Slogan */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    fontSize: '0.8125rem',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.9)',
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={13} style={{ color: '#38bdf8' }} />
                  <span>Better Learning • Brighter Future</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pill-Style Search & Category Filter Bar */}
      <section className="container" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Search Input with Icon */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={17}
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
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 16px 9px 40px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color var(--transition-fast)'
              }}
            />
          </div>

          {/* Filter Pill Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {standardCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : 'var(--color-border)',
                    backgroundColor: isSelected ? '#2563eb' : 'var(--color-surface-elevated)',
                    color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles Cards Grid */}
      <section className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-border)',
                borderTopColor: '#38bdf8',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-4)'
              }}
            />
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading verified articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)'
            }}
          >
            <BookOpen size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              No matching articles found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Try adjusting your search query or selecting a different category filter.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 'var(--space-8)'
              }}
            >
              {filteredPosts.slice(0, displayCount).map((post) => {
                const badgeInfo = getCategoryBadgeStyle(post.category);
                const pubDate = post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'Oct 15, 2026';

                return (
                  <article
                    key={post.id}
                    className="card blog-post-card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    {/* Cover Image Container */}
                    <div style={{ height: '210px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-surface-elevated)' }}>
                      <img
                        src={
                          post.cover_image_url ||
                          'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                        className="blog-card-img"
                        loading="lazy"
                      />

                      {/* Floating Category Badge (Glassmorphic) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: badgeInfo.bg,
                          border: badgeInfo.border,
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {badgeInfo.icon}
                        <span>{post.category || 'General'}</span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Meta Details: Author & Date */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: 'var(--color-text-secondary)',
                          marginBottom: 'var(--space-3)'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <User size={14} style={{ color: 'var(--color-brand-primary)' }} />
                          <span style={{ fontWeight: 500 }}>{post.author_name || 'MindSparQ Team'}</span>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                          <span>{pubDate}</span>
                        </span>
                      </div>

                      {/* Post Title */}
                      <h2
                        style={{
                          fontSize: '1.1875rem',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)',
                          lineHeight: 1.35,
                          marginBottom: 'var(--space-3)'
                        }}
                      >
                        <Link
                          to={`/blog/${post.slug}`}
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                          className="blog-title-link"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.6,
                          marginBottom: 'var(--space-6)',
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {post.excerpt}
                      </p>

                      {/* Card Footer: Read More + Read Time Pill */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 'var(--space-4)',
                          borderTop: '1px solid var(--color-border)'
                        }}
                      >
                        {/* Read More Button with circular arrow */}
                        <Link
                          to={`/blog/${post.slug}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--color-text-primary)',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'color var(--transition-fast)'
                          }}
                          className="read-more-btn"
                        >
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ArrowRight size={13} />
                          </span>
                          <span>Read More</span>
                        </Link>

                        {/* Read Time Badge */}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--color-surface-elevated)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          <Clock size={12} />
                          <span>{post.read_time || '5 min read'}</span>
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Bottom View More Action matching the screenshot divider style */}
            {filteredPosts.length > displayCount ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 'var(--space-12)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent 0%, var(--color-border) 30%, var(--color-border) 70%, transparent 100%)',
                    zIndex: 0
                  }}
                />
                <button
                  type="button"
                  onClick={() => setDisplayCount((prev) => prev + 6)}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                    color: '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(56, 189, 248, 0.35)',
                    transition: 'transform var(--transition-fast)'
                  }}
                >
                  <span>View More Articles</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* Responsive styles */}
      <style>{`
        .blog-post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25) !important;
          border-color: rgba(56, 189, 248, 0.4) !important;
        }
        .blog-post-card:hover .blog-card-img {
          transform: scale(1.04);
        }
        .blog-title-link:hover {
          color: var(--color-brand-primary) !important;
        }
        .read-more-btn:hover {
          color: #38bdf8 !important;
        }
        @media (min-width: 900px) {
          .blog-hero-grid {
            grid-template-columns: 1.25fr 0.75fr !important;
          }
        }
      `}</style>
    </div>
  );
};
