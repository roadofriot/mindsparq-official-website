import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, BookOpen, Cpu, ChevronLeft, ChevronRight, Pause, Play, Phone, MessageCircle } from 'lucide-react';
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
    }, 5000);

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
        paddingTop: 'var(--space-6)',
        paddingBottom: 'var(--space-12)',
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

      <div style={{ width: '100%', maxWidth: '1540px', margin: '0 auto', padding: '0 clamp(16px, 2.5vw, 32px)', position: 'relative', zIndex: 1 }}>
        {/* Dynamic Carousel Slide Mode (if published slides exist) */}
        {activeSlide ? (
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-2xl)',
              backgroundColor: '#070b14',
              border: '1px solid var(--color-border)',
              minHeight: 'clamp(360px, 42vw, 520px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}
          >
            {/* All Slide Images with Smooth Cross-Fade Transition */}
            {slides.map((slide, idx) => {
              const isCurrent = idx === currentSlideIndex;
              return (
                <div
                  key={slide.id}
                  aria-hidden={!isCurrent}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: isCurrent ? 1 : 0,
                    opacity: isCurrent ? 1 : 0,
                    visibility: isCurrent ? 'visible' : 'hidden',
                    transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: isCurrent ? 'auto' : 'none'
                  }}
                >
                  <picture>
                    {slide.mobile_image_url && (
                      <source media="(max-width: 768px)" srcSet={slide.mobile_image_url} />
                    )}
                    <img
                      src={slide.image_url}
                      alt={slide.alt_text}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  </picture>
                </div>
              );
            })}

            {/* Subtle Bottom Vignette (Leaves 75%+ of banner completely clear & vivid) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(5, 8, 16, 0.72) 0%, rgba(5, 8, 16, 0.22) 28%, transparent 55%)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />

            {/* Compact Shady Translucent Caption Card (Leaves logo & flyer artwork visible) */}
            {activeSlide.title && activeSlide.subtitle !== '__HIDE_TEXT__' && (
              <div
                style={{
                  position: 'relative',
                  zIndex: 3,
                  margin: '0 clamp(16px, 2.5vw, 32px) var(--space-4)',
                  maxWidth: 'min(480px, 90%)',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(8, 14, 26, 0.52)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  boxShadow: '0 10px 30px -8px rgba(0, 0, 0, 0.5)',
                  color: '#ffffff',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(14, 165, 233, 0.22)',
                    border: '1px solid rgba(56, 189, 248, 0.45)',
                    color: '#38bdf8',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '6px'
                  }}
                >
                  <Sparkles size={11} />
                  <span>Featured Announcement</span>
                </div>

                <h2
                  style={{
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    marginBottom: activeSlide.subtitle ? '4px' : '0',
                    color: '#ffffff',
                    letterSpacing: '-0.01em',
                    textShadow: '0 2px 6px rgba(0,0,0,0.85)'
                  }}
                >
                  {activeSlide.title}
                </h2>

                {activeSlide.subtitle && (
                  <p
                    style={{
                      fontSize: 'clamp(0.75rem, 1.1vw, 0.85rem)',
                      lineHeight: 1.45,
                      color: '#cbd5e1',
                      marginBottom: activeSlide.cta_label && activeSlide.cta_url ? '10px' : '0',
                      textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {activeSlide.subtitle}
                  </p>
                )}

                {activeSlide.cta_label && activeSlide.cta_url && (
                  <Link
                    to={activeSlide.cta_url}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 16px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: '9999px',
                      boxShadow: '0 3px 12px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    <span>{activeSlide.cta_label}</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            )}

            {/* Carousel Controls (Previous / Next / Pause / Indicators) */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px clamp(16px, 2.5vw, 32px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(6, 10, 18, 0.55)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)'
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
                      backgroundColor: idx === currentSlideIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next / Pause Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  title={isPaused ? 'Resume auto-rotation' : 'Pause auto-rotation'}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {isPaused ? <Play size={13} /> : <Pause size={13} />}
                </button>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <ChevronRight size={18} />
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
                <span>EDUCATION • INNOVATION • AI • STEM • DIGITAL LEARNING</span>
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
                {siteConfig.name} unites foundational cognitive arts—Abacus, Mental Math, Vedic Mathematics, and bilingual penmanship—with modern applied AI, Coding, and Robotics to empower independent thinkers and young creators in Nepal.
              </p>

              <div 
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  alignItems: 'center'
                }}
              >
                <Link to="/programs" className="btn btn-primary btn-lg">
                  <span>Explore Programs</span>
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a href="tel:+9779857058666" className="btn btn-secondary btn-lg">
                  <Phone size={17} aria-hidden="true" />
                  <span>Call: +977 9857058666</span>
                </a>
                <a 
                  href="https://wa.me/9779857058666?text=Namaste%20MindSparQ%2C%20I%20would%20like%20to%20inquire%20about%20courses%20and%20admissions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-lg"
                >
                  <MessageCircle size={17} color="#16a34a" aria-hidden="true" />
                  <span>WhatsApp Admissions</span>
                </a>
              </div>

              {/* Credibility verification note */}
              <div 
                style={{
                  marginTop: 'var(--space-8)',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-accent-teal)' }} />
                  Founder & CEO: {siteConfig.founder.name}
                </span>
                <span>•</span>
                <span>Butwal-11, Rupandehi</span>
                <span>•</span>
                <span style={{ color: 'var(--color-brand-primary)', fontWeight: 600 }}>{siteConfig.domain}</span>
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
