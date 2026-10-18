import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPagesInventory } from '../../services/pageService';
import {
  FileText,
  ExternalLink,
  Edit3,
  RefreshCw,
  Search,
  Compass
} from 'lucide-react';
import { AccessibleHint } from '../../components/ui/AccessibleHint';

export const AdminPagesManagerPage: React.FC = () => {
  const [pages, setPages] = useState<Array<{
    slug: string;
    route: string;
    name: string;
    title: string;
    status: 'draft' | 'published';
    updatedAt: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await getPagesInventory();
    setPages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: 'var(--space-6) 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-600)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Compass size={16} /> Content Architecture
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0', color: 'var(--color-text)' }}>
            All Public Pages
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Central directory of all discoverable pages across MindSparQ Education & Technology.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <AccessibleHint text="Reload fresh pages inventory from cloud CMS" shortcut="Alt+R">
            <button
              type="button"
              onClick={loadData}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </AccessibleHint>
          <AccessibleHint text="Launch Visual Website Builder workspace" shortcut="Alt+B">
            <Link
              to="/admin/builder?page=about"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <Edit3 size={14} /> Open Website Builder
            </Link>
          </AccessibleHint>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: 'var(--space-6)', maxWidth: '400px', position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by page name, slug, or route..."
          style={{
            width: '100%',
            padding: '10px 12px 10px 38px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '0.875rem'
          }}
        />
      </div>

      {/* Pages Table */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading pages inventory...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>No pages matching &quot;{searchQuery}&quot;.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Page Name</th>
                <th style={{ padding: '12px 16px' }}>Public Route</th>
                <th style={{ padding: '12px 16px' }}>Headline Title</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Last Updated</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.slug} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--color-primary-600)' }} />
                      <span>{page.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                    {page.route}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text)' }}>
                    {page.title}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: page.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: page.status === 'published' ? '#16a34a' : '#ca8a04'
                      }}
                    >
                      {page.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                    {new Date(page.updatedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <AccessibleHint text="Open live public URL in a new tab">
                        <a
                          href={page.route}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={12} /> View
                        </a>
                      </AccessibleHint>
                      <AccessibleHint text="Open in visual page editor">
                        <Link
                          to={`/admin/builder?page=${page.slug}`}
                          className="btn btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={12} /> Customize
                        </Link>
                      </AccessibleHint>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
