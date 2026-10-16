import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getAllComments } from '../../services/blogService';
import { getAllEvents } from '../../services/eventService';
import { getAllCourses } from '../../services/courseService';
import { getAuditLogs } from '../../services/auditService';
import { getTrafficStats, TrafficStats } from '../../services/analyticsService';
import { AuditLog } from '../../types/database';
import {
  FileText,
  Calendar,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Eye,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    postsCount: 0,
    draftPostsCount: 0,
    eventsCount: 0,
    coursesCount: 0,
    pendingCommentsCount: 0
  });
  const [traffic, setTraffic] = useState<TrafficStats | null>(null);
  const [recentAudits, setRecentAudits] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      getAllPosts(),
      getAllEvents(),
      getAllCourses(),
      getAllComments('pending'),
      getAuditLogs(10),
      getTrafficStats()
    ])
      .then(([posts, events, courses, pendingComments, audits, trafficStats]) => {
        if (!mounted) return;
        setMetrics({
          postsCount: posts.length,
          draftPostsCount: posts.filter((p) => p.status === 'draft').length,
          eventsCount: events.length,
          coursesCount: courses.length,
          pendingCommentsCount: pendingComments.length
        });
        setRecentAudits(audits);
        setTraffic(trafficStats);
      })
      .catch((err) => console.error('Error fetching admin dashboard metrics:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
          Administration Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
          Real-time database metrics, content publishing workflows, and moderation queue.
        </p>
      </div>

      {/* Section 1: Visitor Traffic & Audience Engagement */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              Visitor Traffic & Public Engagement
            </h2>
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Real-time daily, weekly, monthly and cumulative visits
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)'
          }}
        >
          {/* Today's Visits */}
          <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--color-primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Today's Visits
              </span>
              <Eye size={16} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {traffic ? traffic.todayVisits.toLocaleString() : '—'}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#10b981', fontWeight: 600 }}>
              ~{traffic ? traffic.todayUnique : 0} unique visitors today
            </span>
          </div>

          {/* Past 7 Days */}
          <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Past 7 Days
              </span>
              <TrendingUp size={16} style={{ color: '#10b981' }} />
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {traffic ? traffic.weekVisits.toLocaleString() : '—'}
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
              Weekly audience reach
            </span>
          </div>

          {/* Past 30 Days */}
          <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Past 30 Days
              </span>
              <Calendar size={16} style={{ color: '#8b5cf6' }} />
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {traffic ? traffic.monthVisits.toLocaleString() : '—'}
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
              Monthly learning queries
            </span>
          </div>

          {/* Total All-Time Visits */}
          <div className="card" style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                Total Cumulative Visits
              </span>
              <Users size={16} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)' }}>
              {traffic ? traffic.totalVisits.toLocaleString() : '—'}
            </div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
              All-time platform hits
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: Content & Publishing Metrics */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Database & Content Metrics
        </h2>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)'
        }}
      >
        {/* Posts Metric */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Blog Posts
            </span>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {loading ? '—' : metrics.postsCount}
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            {metrics.draftPostsCount} currently in draft
          </span>
        </div>

        {/* Courses Metric */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Courses
            </span>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <BookOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {loading ? '—' : metrics.coursesCount}
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Free learning curricula
          </span>
        </div>

        {/* Events Metric */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Events & Workshops
            </span>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: 'var(--color-text)' }}>
            {loading ? '—' : metrics.eventsCount}
          </div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)' }}>
            Published schedules
          </span>
        </div>

        {/* Pending Comments */}
        <div className="card" style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Pending Comments
            </span>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, color: metrics.pendingCommentsCount > 0 ? '#ef4444' : 'var(--color-text)' }}>
            {loading ? '—' : metrics.pendingCommentsCount}
          </div>
          <Link to="/admin/comments" style={{ fontSize: 'var(--font-xs)', color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 600 }}>
            Review Moderation Queue →
          </Link>
        </div>
      </div>

      {/* Quick Actions & Recent Audit Logs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Quick Publishing Actions */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
            Quick Publishing Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link
              to="/admin/ai-assistant"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', borderColor: 'var(--color-primary-600)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                <Sparkles size={16} /> Launch AI Studio & Assistant
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/admin/sections"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Layers size={16} /> Customize Homepage Sections
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/admin/blog"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <PlusCircle size={16} /> Draft New Blog Article
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/admin/events"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <PlusCircle size={16} /> Schedule Workshop / Event
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/admin/carousel"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <PlusCircle size={16} /> Manage Homepage Carousel Slides
              </span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/admin/media"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <PlusCircle size={16} /> Upload Media & Photos
              </span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Security Audit Activity */}
        <div className="card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, color: 'var(--color-text)' }}>
              Recent Security Audit Activity
            </h2>
            <ShieldCheck size={20} style={{ color: 'var(--color-primary-600)' }} />
          </div>

          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>Loading audit trail...</p>
          ) : recentAudits.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)' }}>
              No audit records generated yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentAudits.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-hover)',
                    fontSize: 'var(--font-xs)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{log.action}</span>
                    <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' }}>
                      by {log.actor_email || 'System'}
                    </span>
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Clock size={12} /> {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
