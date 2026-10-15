import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, BookOpen, Cpu, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { siteConfig } from '../../content/site';
import { getPublishedCarouselItems } from '../../services/contentService';
import { CarouselItem } from '../../types/database';

export const Hero: React.FC = () => {
  const [slides, setSlides] = useState<CarouselItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    getPublishedCarouselItems()
      .then((data) => {
        if (!mounted) return;
        if (data && data.length > 0) {
          setSlides(data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const nextSlide = useCallback(() => {
    setSlides((current) => {
      if (current.length === 0) return current;
      setCurrentSlideIndex((prev) => (prev + 1) % current.length);
      return current;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setSlides((current) => {
      if (current.length === 0) return current;
      setCurrentSlideIndex((prev) => (prev - 1 + current.length) % current.length);
      return current;
    });
  }, []);

  // Auto rotation with prefers-reduced-motion check
  useEffect(() => {
    if (slides.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused, nextSlide]);

  // Keyboard navigation for carousel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const activeSlide = slides.length > 0 ? slides[currentSlideIndex] : null;

  return (
    <section 
      style={{
        position: 'relative',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-16)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={slides.length > 0 ? 0 : undefined}
      aria-roledescription={slides.length > 0 ? 'carousel' : undefined}
      aria-label="MindSparQ Featured Announcements"
    >
      {/* Background Subtle Gradient Blobs */}
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-brand-primary-soft) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--color-accent-teal-soft) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Dynamic Carousel Slide Mode (if published slides exist) */}
        {activeSlide ? (
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
          >
            {/* Slide Image Background */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              <img
                src={activeSlide.image_url}
                alt={activeSlide.alt_text}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 60%, rgba(0, 0, 0, 0.2) 100%)'
                }}
              />
            </div>

            {/* Slide Content Overlay */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: 'var(--space-12) var(--space-8) var(--space-8)',
                maxWidth: '720px',
                color: '#ffffff'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(14, 165, 233, 0.9)',
                  fontSize: 'var(--font-xs)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Sparkles size={14} /> Featured Announcement
              </div>

              <h1
                style={{
                  fontSize: 'var(--font-4xl)',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginBottom: 'var(--space-3)',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(0,0,0,0.4)'
                }}
              >
                {activeSlide.title}
              </h1>

              {activeSlide.subtitle && (
                <p
                  style={{
                    fontSize: 'var(--font-lg)',
                    lineHeight: 1.6,
                    color: 'rgba(255, 255, 255, 0.9)',
                    marginBottom: 'var(--space-6)',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {activeSlide.subtitle}
                </p>
              )}

              {activeSlide.cta_label && activeSlide.cta_url && (
                <Link
                  to={activeSlide.cta_url}
                  className="btn btn-primary btn-lg"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                >
                  <span>{activeSlide.cta_label}</span>
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>

            {/* Carousel Controls (Previous / Next / Pause / Indicators) */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4) var(--space-8)',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)'
              }}
            >
              {/* Dots */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: idx === currentSlideIndex ? '28px' : '8px',
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: idx === currentSlideIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Default Static Hero Banner */
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--space-12)',
              alignItems: 'center'
            }}
            className="hero-grid"
          >
            {/* Hero Content */}
            <div style={{ maxWidth: '680px' }}>
              <div className="eyebrow">
                <Sparkles size={14} aria-hidden="true" />
                <span>EDUCATION • MATHEMATICS • TECHNOLOGY</span>
              </div>

              <h1 
                style={{
                  fontSize: 'var(--text-5xl)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: 'var(--space-6)',
                  color: 'var(--color-text-primary)'
                }}
              >
                Empowering Minds, <br />
                <span 
                  style={{
                    background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-accent-teal) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Sparking Innovation.
                </span>
              </h1>

              <p 
                style={{
                  fontSize: 'var(--text-lg)',
                  lineHeight: 1.7,
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-8)'
                }}
              >
                {siteConfig.name} helps learners build confidence in mathematics, explore creative problem-solving, and discover the possibilities of coding, AI, and robotics through engaging learning experiences.
              </p>

              <div 
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  alignItems: 'center'
                }}
              >
                <Link to="/courses" className="btn btn-primary btn-lg">
                  <BookOpen size={18} aria-hidden="true" />
                  <span>Explore Courses</span>
                </Link>
                <Link to="/programs" className="btn btn-secondary btn-lg">
                  <span>Our Programs</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/contact" className="btn btn-secondary btn-lg">
                  <Compass size={18} aria-hidden="true" />
                  <span>Contact Center</span>
                </Link>
              </div>

              {/* Credibility verification note */}
              <div 
                style={{
                  marginTop: 'var(--space-8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-teal)' }} />
                  Based in Butwal, Rupandehi
                </span>
                <span>•</span>
                <span>Research-Backed Learning</span>
                <span>•</span>
                <span>Hands-On Pedagogy</span>
              </div>
            </div>

            {/* Hero Feature Visual Card */}
            <div 
              className="hero-visual"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}
            >
              <div 
                className="card"
                style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(8px)',
                  borderColor: 'var(--color-border)',
                  padding: 'var(--space-8)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-brand-primary)', textTransform: 'uppercase' }}>
                    Educational Pillars
                  </span>
                  <span className="eyebrow eyebrow-teal" style={{ margin: 0 }}>
                    Active Learning
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-brand-primary-soft)', color: 'var(--color-brand-primary)' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>Mathematics & Mental Skills</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Abacus and Vedic calculation methods to nurture intuition, focus, and speed.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-teal-soft)', color: 'var(--color-accent-teal)' }}>
                      <Cpu size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>AI Coding & Robotics</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Physical computing, sensor circuits, and logic foundations for modern young creators.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-amber-highlight-soft)', color: '#B45309' }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>Penmanship & Communication</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Disciplined handwriting in English and Devanagari script for academic excellence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 992px) {
          .hero-grid {
            grid-template-columns: 1.2fr 0.8fr !important;
          }
        }
      `}</style>
    </section>
  );
};
