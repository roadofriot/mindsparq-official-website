import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventBySlug } from '../services/eventService';
import { Event } from '../types/database';
import { Calendar, MapPin, ArrowLeft, Share2, ExternalLink, ShieldCheck } from 'lucide-react';
import { sharePublicContent, getSocialShareUrls } from '../services/socialService';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    getEventBySlug(slug)
      .then((data) => {
        if (mounted) setEvent(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

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

  if (!event) {
    return (
      <div className="container" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Event Not Found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          The requested event could not be found or has been concluded.
        </p>
        <Link to="/events" className="btn btn-primary">
          Browse All Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.starts_at);
  const shareUrls = getSocialShareUrls(window.location.href, event.title);

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-8)' }}>
        <Link
          to="/events"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-sm)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>

      <div className="container" style={{ maxWidth: '900px' }}>
        {event.cover_image_url && (
          <div
            style={{
              height: '340px',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              marginBottom: 'var(--space-8)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <img
              src={event.cover_image_url}
              alt={event.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            color: 'var(--color-primary-600)',
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            marginBottom: 'var(--space-3)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={18} />
            {startDate.toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        <h1
          style={{
            fontSize: 'var(--font-4xl)',
            fontWeight: 800,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)',
            lineHeight: 1.2
          }}
        >
          {event.title}
        </h1>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-base)',
            marginBottom: 'var(--space-8)'
          }}
        >
          <MapPin size={18} style={{ color: 'var(--color-primary-600)' }} />
          <span>{event.location_text}</span>
        </div>

        {/* Action Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-8)'
          }}
        >
          {event.registration_url ? (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <span>Register for this Event</span>
              <ExternalLink size={16} />
            </a>
          ) : (
            <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
              Open public attendance (No pre-registration required)
            </div>
          )}

          {/* Share links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>Share:</span>
            <button
              onClick={() => sharePublicContent(event.title, event.summary, window.location.href)}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: 'var(--font-xs)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Share2 size={14} /> Copy Link
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

        {/* Full Description */}
        <div
          style={{
            fontSize: 'var(--font-lg)',
            lineHeight: 1.8,
            color: 'var(--color-text)',
            whiteSpace: 'pre-line',
            marginBottom: 'var(--space-12)'
          }}
        >
          {event.description}
        </div>

        <div
          style={{
            padding: 'var(--space-6)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            gap: 'var(--space-4)'
          }}
        >
          <ShieldCheck size={28} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 700, marginBottom: 'var(--space-1)' }}>
              Official MindSparQ Event Notice
            </h4>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              All schedules, venue directions, and seating protocols are organized under official supervision at Butwal, Nepal. If you have inquiries regarding group reservations or school cohort participation, please reach us through our contact center.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
