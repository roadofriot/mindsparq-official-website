import React, { useState, useEffect } from 'react';
import {
  getAllRecentVersions,
  restoreContentVersion,
  SupportedContentType
} from '../../services/versionService';
import { ContentVersion } from '../../types/database';
import {
  History,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  Eye
} from 'lucide-react';
import { AccessibleHint } from '../../components/ui/AccessibleHint';

export const AdminRevisionsPage: React.FC = () => {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<SupportedContentType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingVersion, setInspectingVersion] = useState<ContentVersion | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const filter = selectedType === 'all' ? undefined : selectedType;
    const data = await getAllRecentVersions(filter);
    setVersions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setStatusNotice({ type, message });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleRestore = async (ver: ContentVersion) => {
    if (!window.confirm(`Restore version #${ver.version_number} of "${ver.title}" (${ver.content_type})? This will load the historic snapshot into active draft/configuration.`)) return;

    const res = await restoreContentVersion(ver);
    if (res.success) {
      showNotice('success', `Successfully restored version #${ver.version_number}.`);
      loadData();
      if (inspectingVersion?.id === ver.id) {
        setInspectingVersion(null);
      }
    } else {
      showNotice('error', res.error?.message || 'Restore failed.');
    }
  };

  const filteredVersions = versions.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.content_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.change_summary && v.change_summary.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: 'var(--space-6) 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-600)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <History size={16} /> Audit & Recovery System
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0', color: 'var(--color-text)' }}>
            Revision History & Rollback
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Inspect chronological snapshots across pages, layout sections, headers, and footers with single-click restoration.
          </p>
        </div>

        <AccessibleHint text="Reload recent immutable versions from database" shortcut="Alt+R">
          <button
            type="button"
            onClick={loadData}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh History
          </button>
        </AccessibleHint>
      </div>

      {statusNotice && (
        <div
          style={{
            padding: '10px 16px',
            marginBottom: 'var(--space-4)',
            borderRadius: '8px',
            backgroundColor: statusNotice.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: statusNotice.type === 'success' ? '#15803d' : '#b91c1c',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {statusNotice.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, entity ID, or summary..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Content Types</option>
            <option value="page">Public Pages</option>
            <option value="header">Global Header</option>
            <option value="footer">Global Footer</option>
            <option value="site_section">Homepage Sections</option>
            <option value="blog_post">Blog Articles</option>
            <option value="course">Curriculum Courses</option>
          </select>
        </div>
      </div>

      {/* Versions List */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading revisions...</p>
        </div>
      ) : filteredVersions.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <History size={32} style={{ color: 'var(--color-text-secondary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>No revisions found for the current query.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>Version</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Entity Title / Identifier</th>
                <th style={{ padding: '12px 16px' }}>Change Summary</th>
                <th style={{ padding: '12px 16px' }}>Editor</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVersions.map((ver) => (
                <tr key={ver.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                    v{ver.version_number}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {ver.content_type.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-text)' }}>
                    <div>{ver.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      ID: {ver.content_id}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text)' }}>
                    {ver.change_summary || 'Standard publication snapshot'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                    {ver.created_by_name || 'Staff Editor'}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                    {new Date(ver.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <AccessibleHint text="Inspect snapshot payload JSON and details">
                        <button
                          type="button"
                          onClick={() => setInspectingVersion(ver)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Inspect
                        </button>
                      </AccessibleHint>
                      <AccessibleHint text="Restore this version into active draft or live configuration">
                        <button
                          type="button"
                          onClick={() => handleRestore(ver)}
                          className="btn btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RotateCcw size={12} /> Restore
                        </button>
                      </AccessibleHint>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Snapshot Inspection Modal */}
      {inspectingVersion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  Snapshot Payload: v{inspectingVersion.version_number} — {inspectingVersion.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Recorded on {new Date(inspectingVersion.created_at).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectingVersion(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#070e1a' }}>
              <pre style={{ margin: 0, fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(inspectingVersion.snapshot, null, 2)}
              </pre>
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setInspectingVersion(null)} className="btn btn-secondary">
                Close
              </button>
              <button
                type="button"
                onClick={() => handleRestore(inspectingVersion)}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={14} /> Restore this Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
