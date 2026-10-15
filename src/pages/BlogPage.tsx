import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPosts } from '../services/blogService';
import { BlogPost } from '../types/database';
import { BookOpen, Calendar, User, Search, Sparkles, ArrowRight } from 'lucide-react';

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'fallback-blog-1',
    slug: 'why-abacus-training-enhances-mathematical-fluency',
    title: 'Why Abacus Training Enhances Mathematical Fluency in Early Childhood',
    excerpt: 'Discover how tactile bead calculation transitions into spatial mental arithmetic, fostering concentration and numerical confidence.',
    content: 'Tactile calculation through the soroban abacus remains one of the most effective methods to develop cognitive number sense...',
    cover_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    category: 'Cognitive Skills',
    author_name: 'MindSparQ Academic Team',
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
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
    published_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    let mounted = true;
    getPublishedPosts()
      .then((data) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setPosts(data);
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

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Hero Banner */}
      <section
        style={{
          padding: 'var(--space-16) 0 var(--space-12)',
          background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.12), transparent 70%)',
          borderBottom: '1px solid var(--color-border)',
          textAlign: 'center'
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 'var(--space-3)'
            }}
          >
            <Sparkles size={14} /> Insights & Education
          </div>
          <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            MindSparQ Blog & Knowledge Base
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-lg)', lineHeight: 1.6 }}>
            Pedagogical insights, computational thinking methodologies, abacus mastery techniques, and educational tech perspectives from Nepal.
          </p>
        </div>
      </section>

      {/* Filter & Search */}
      <section className="container" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)'
              }}
            />
            <input
              type="text"
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px', width: '100%' }}
            />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? 'var(--color-primary-600)' : 'var(--color-border)',
                  backgroundColor: selectedCategory === cat ? 'var(--color-primary-50)' : 'var(--color-surface)',
                  color: selectedCategory === cat ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
                  fontWeight: selectedCategory === cat ? 600 : 400,
                  fontSize: 'var(--font-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary-600)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-4)'
              }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading articles...</p>
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
            <BookOpen size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              No matching articles found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Try adjusting your search criteria or resetting categories.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {filteredPosts.map((post) => {
              const pubDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'Recent';

              return (
                <article
                  key={post.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  {post.cover_image_url && (
                    <div style={{ height: '200px', position: 'relative' }}>
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(14, 165, 233, 0.9)',
                          color: '#ffffff',
                          fontSize: 'var(--font-xs)',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        {post.category}
                      </span>
                    </div>
                  )}

                  <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)',
                        fontSize: 'var(--font-xs)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-3)'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} /> {post.author_name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {pubDate}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: 'var(--font-xl)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginBottom: 'var(--space-2)',
                        lineHeight: 1.3
                      }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {post.title}
                      </Link>
                    </h2>

                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-sm)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-6)',
                        flex: 1
                      }}
                    >
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/blog/${post.slug}`}
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        width: '100%'
                      }}
                    >
                      <span>Read Article</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
