import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedEvents } from '../services/eventService';
import { Event } from '../types/database';
import { Calendar, MapPin, ArrowRight, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { sharePublicContent } from '../services/socialService';
import { updatePageSeo } from '../utils/seo';

const FALLBACK_EVENTS: { upcoming: Event[]; past: Event[] } = {
  upcoming: [
    {
      id: 'fallback-ev-1',
      slug: 'annual-stem-innovation-exhibition',
      title: 'Annual STEM & Robotics Exhibition 2026',
      summary: 'A public exhibition of student-engineered robotics prototypes, mental arithmetic speed demonstrations, and interactive tech displays.',
      description: 'Join MindSparQ Education & Technology in Butwal to witness future young innovators demonstrate sensor mechanisms, autonomous rovers, and rapid calculation.',
      cover_image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
      location_text: 'Butwal 11, Gyanbhoomi Path, Rupandehi, Nepal',
      starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000).toISOString(),
      registration_url: 'https://mindsparqeducation.com.np/contact',
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  past: []
};

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<{ upcoming: Event[]; past: Event[] }>({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    updatePageSeo({
      title: 'Community Events & STEM Exhibitions',
      description: 'Upcoming hackathons, robotics showcases, abacus mental math competitions, and teacher workshops in Butwal, Nepal.',
      canonicalPath: '/events',
      ogType: 'website'
    });

    let mounted = true;
    getPublishedEvents()
      .then((data) => {
        if (!mounted) return;
        if (data.upcoming.length > 0 || data.past.length > 0) {
          setEvents(data);
        } else {
          setEvents(FALLBACK_EVENTS);
        }
      })
      .catch(() => {
        if (mounted) setEvents(FALLBACK_EVENTS);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleShare = async (e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.slug}`;
    const result = await sharePublicContent(event.title, event.summary, url);
    if (result.method === 'clipboard' && result.success) {
      alert('Event link copied to clipboard!');
    }
  };

  const currentList = tab === 'upcoming' ? events.upcoming : events.past;

  return (
    <div style={{ paddingBottom: 'var(--space-16)' }}>
      {/* Banner */}
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
            <Sparkles size={14} /> Workshops & Exhibitions
          </div>
          <h1 style={{ fontSize: 'var(--font-4xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            Events, Workshops & Competitions
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-lg)', lineHeight: 1.6 }}>
            Hands-on learning symposiums, robotics challenges, and community workshops across Lumbini Province.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="container" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <button
            onClick={() => setTab('upcoming')}
            className={`btn ${tab === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: 'var(--space-2) var(--space-6)' }}
          >
            Upcoming Events ({events.upcoming.length})
          </button>
          <button
            onClick={() => setTab('past')}
            className={`btn ${tab === 'past' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: 'var(--space-2) var(--space-6)' }}
          >
            Past Events ({events.past.length})
          </button>
        </div>
      </section>

      {/* Events List */}
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
            <p style={{ color: 'var(--color-text-secondary)' }}>Loading event schedules...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-4)',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <Calendar size={48} style={{ color: 'var(--color-text-secondary)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
              No {tab} events scheduled
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Please check back soon or follow our verified official social channels for announcements.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {currentList.map((event) => {
              const startDate = new Date(event.starts_at);
              const formattedDate = startDate.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const formattedTime = startDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={event.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-xl)'
                  }}
                >
                  {/* Event Cover Image */}
                  {event.cover_image_url && (
                    <div style={{ height: '180px', position: 'relative' }}>
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Date Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 'var(--space-3)'
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-2)',
                          fontSize: 'var(--font-xs)',
                          fontWeight: 700,
                          color: 'var(--color-primary-600)',
                          backgroundColor: 'var(--color-primary-50)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <Calendar size={14} />
                        <span>{formattedDate} • {formattedTime}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleShare(e, event)}
                        title="Share Event"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-secondary)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>

                    <h3
                      style={{
                        fontSize: 'var(--font-xl)',
                        fontWeight: 700,
                        color: 'var(--color-text)',
                        marginBottom: 'var(--space-2)',
                        lineHeight: 1.3
                      }}
                    >
                      {event.title}
                    </h3>

                    {/* Venue Location */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--font-xs)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 'var(--space-4)'
                      }}
                    >
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{event.location_text}</span>
                    </div>

                    <p
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-sm)',
                        lineHeight: 1.6,
                        marginBottom: 'var(--space-6)',
                        flex: 1
                      }}
                    >
                      {event.summary}
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'auto' }}>
                      <Link
                        to={`/events/${event.slug}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                      >
                        <span>Details</span>
                        <ArrowRight size={16} />
                      </Link>

                      {event.registration_url && (
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                          <span>Register</span>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
