import React, { useState } from 'react';
import { SiteSection } from '../../services/siteCustomizerService';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  Cpu,
  Award,
  Eye,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { getSafeYouTubeEmbedUrl } from '../../services/courseService';
import { marked } from 'marked';

interface CustomBlockRendererProps {
  section: SiteSection;
}

export const CustomBlockRenderer: React.FC<CustomBlockRendererProps> = ({ section }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const layout = section.layout_style || {};
  const content = section.content_json || {};

  const align = layout.alignment || 'left';
  const textAlign = align === 'center' ? 'center' : align === 'right' ? 'right' : 'left';

  const headingSize = () => {
    switch (layout.headingScale) {
      case 'sm': return 'clamp(1.25rem, 3vw, 1.75rem)';
      case 'lg': return 'clamp(1.75rem, 5vw, 2.75rem)';
      case 'display': return 'clamp(2.25rem, 6vw, 3.5rem)';
      case 'md':
      default:
        return 'clamp(1.5rem, 4vw, 2.25rem)';
    }
  };

  const renderBadgeAndHeader = () => (
    <div style={{ textAlign, marginBottom: 'var(--space-8, 32px)' }}>
      {section.badge && (
        <span
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            marginBottom: 'var(--space-3, 12px)'
          }}
        >
          {section.badge}
        </span>
      )}
      <h2
        style={{
          fontSize: headingSize(),
          fontWeight: 800,
          color: 'var(--color-text-primary, #14213D)',
          lineHeight: 1.25,
          margin: '0 0 var(--space-3, 12px)'
        }}
      >
        {section.title}
      </h2>
      {section.subtitle && (
        <p
          style={{
            fontSize: 'var(--font-base, 1rem)',
            color: 'var(--color-text-secondary, #94a3b8)',
            maxWidth: align === 'center' ? '760px' : '100%',
            margin: align === 'center' ? '0 auto' : '0',
            lineHeight: 1.6
          }}
        >
          {section.subtitle}
        </p>
      )}
    </div>
  );

  const renderButtons = () => {
    if (!layout.ctaButtonText && !layout.secondaryButtonText) return null;
    return (
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-4, 16px)',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          marginTop: 'var(--space-6, 24px)',
          flexWrap: 'wrap'
        }}
      >
        {layout.ctaButtonText && layout.ctaButtonUrl && (
          layout.ctaButtonUrl.startsWith('http') || layout.ctaButtonUrl.startsWith('tel:') ? (
            <a
              href={layout.ctaButtonUrl}
              target={layout.ctaButtonTarget || '_self'}
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{layout.ctaButtonText}</span>
              <ArrowRight size={16} />
            </a>
          ) : (
            <Link
              to={layout.ctaButtonUrl}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{layout.ctaButtonText}</span>
              <ArrowRight size={16} />
            </Link>
          )
        )}

        {layout.secondaryButtonText && layout.secondaryButtonUrl && (
          layout.secondaryButtonUrl.startsWith('http') || layout.secondaryButtonUrl.startsWith('tel:') ? (
            <a
              href={layout.secondaryButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              {layout.secondaryButtonText}
            </a>
          ) : (
            <Link to={layout.secondaryButtonUrl} className="btn btn-secondary">
              {layout.secondaryButtonText}
            </Link>
          )
        )}
      </div>
    );
  };

  // Block Type Renderers
  switch (section.block_type) {
    case 'rich_text': {
      const rawMarkdown = content.markdownBody || '';
      const htmlContent = marked.parse(rawMarkdown) as string;
      return (
        <div>
          {renderBadgeAndHeader()}
          <div
            className="article-prose"
            style={{ maxWidth: '840px', margin: align === 'center' ? '0 auto' : '0' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          {renderButtons()}
        </div>
      );
    }

    case 'feature_grid': {
      const features: { title: string; description: string; icon?: string }[] = content.features || [];
      const getIcon = (name?: string) => {
        switch (name) {
          case 'Cpu': return <Cpu size={24} />;
          case 'Award': return <Award size={24} />;
          case 'Eye': return <Eye size={24} />;
          case 'Zap': return <Zap size={24} />;
          default: return <Sparkles size={24} />;
        }
      };

      return (
        <div>
          {renderBadgeAndHeader()}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6, 24px)'
            }}
          >
            {features.map((feat, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 'var(--space-6, 24px)',
                  borderRadius: 'var(--radius-xl, 16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getIcon(feat.icon)}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary, #14213D)' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary, #94a3b8)', lineHeight: 1.6, margin: 0 }}>
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
          {renderButtons()}
        </div>
      );
    }

    case 'split_media': {
      const isRight = content.mediaPosition !== 'left';
      const bulletPoints: string[] = content.bulletPoints || [];
      const imageUrl = content.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-10, 40px)',
            alignItems: 'center'
          }}
        >
          {/* Copy column */}
          <div style={{ order: isRight ? 1 : 2 }}>
            {renderBadgeAndHeader()}
            {bulletPoints.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--space-4, 16px) 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bulletPoints.map((pt, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9375rem', color: 'var(--color-text-secondary, #cbd5e1)' }}>
                    <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
            {renderButtons()}
          </div>

          {/* Media column */}
          <div style={{ order: isRight ? 2 : 1 }}>
            <div
              style={{
                borderRadius: 'var(--radius-2xl, 20px)',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))'
              }}
            >
              <img
                src={imageUrl}
                alt={section.title}
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'stats_strip': {
      const stats: { number: string; label: string }[] = content.stats || [];
      return (
        <div>
          {renderBadgeAndHeader()}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4, 16px)'
            }}
          >
            {stats.map((item, i) => (
              <div
                key={i}
                className="card"
                style={{
                  padding: 'var(--space-6, 24px)',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-xl, 16px)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '4px'
                  }}
                >
                  {item.number}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary, #94a3b8)' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          {renderButtons()}
        </div>
      );
    }

    case 'video_showcase': {
      const videoId = content.youtubeVideoId || 'dQw4w9WgXcQ';
      const embedUrl = getSafeYouTubeEmbedUrl(videoId);

      return (
        <div>
          {renderBadgeAndHeader()}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              margin: '0 auto',
              paddingBottom: '56.25%',
              borderRadius: 'var(--radius-2xl, 20px)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--color-border, rgba(56, 189, 248, 0.25))',
              backgroundColor: '#000'
            }}
          >
            <iframe
              src={embedUrl}
              title={section.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {renderButtons()}
        </div>
      );
    }

    case 'faq_accordion': {
      const faqs: { question: string; answer: string }[] = content.faqs || [];
      return (
        <div>
          {renderBadgeAndHeader()}
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    borderRadius: 'var(--radius-xl, 14px)',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'var(--color-text-primary, #14213D)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      gap: '12px'
                    }}
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={18} style={{ color: '#38bdf8' }} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 20px 16px 20px',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        color: 'var(--color-text-secondary, #94a3b8)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {renderButtons()}
        </div>
      );
    }

    case 'cta_banner':
    default: {
      return (
        <div
          className="card"
          style={{
            padding: 'var(--space-10, 40px) var(--space-8, 32px)',
            borderRadius: 'var(--radius-2xl, 24px)',
            background: 'linear-gradient(135deg, rgba(36, 87, 214, 0.25) 0%, rgba(2, 132, 199, 0.15) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            textAlign
          }}
        >
          {section.badge && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                marginBottom: '12px'
              }}
            >
              {section.badge}
            </span>
          )}
          <h2
            style={{
              fontSize: headingSize(),
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 12px 0',
              lineHeight: 1.25
            }}
          >
            {section.title}
          </h2>
          {section.subtitle && (
            <p
              style={{
                fontSize: '1rem',
                color: '#cbd5e1',
                maxWidth: '680px',
                margin: align === 'center' ? '0 auto' : '0',
                lineHeight: 1.6
              }}
            >
              {section.subtitle}
            </p>
          )}
          {renderButtons()}
        </div>
      );
    }
  }
};
