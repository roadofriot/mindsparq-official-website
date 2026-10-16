import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getMediaAssets,
  uploadMedia,
  uploadMediaBatch,
  deleteMediaAsset,
  checkMediaUsage,
  MediaUsageReport,
  BatchUploadResult
} from '../../services/mediaService';
import { MediaAsset } from '../../types/database';
import {
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  X,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadMode, setUploadMode] = useState<'single' | 'batch'>('batch');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Single upload form state
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [singleUploading, setSingleUploading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  // Batch upload state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number } | null>(null);
  const [batchResult, setBatchResult] = useState<BatchUploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtering, Searching, & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'size_desc' | 'size_asc' | 'name_asc'>('newest');

  // Deletion safety modal
  const [checkingAssetId, setCheckingAssetId] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<MediaAsset | null>(null);
  const [usageReport, setUsageReport] = useState<MediaUsageReport | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Action notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAssets = () => {
    setLoading(true);
    getMediaAssets()
      .then((data) => setAssets(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Single file handlers
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSingleFile(file);
      if (!altText) {
        setAltText(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) {
      setSingleError('Please select a file to upload.');
      return;
    }
    if (!altText.trim()) {
      setSingleError('Accessibility alt text is required.');
      return;
    }

    setSingleUploading(true);
    setSingleError(null);

    const { data, error } = await uploadMedia(singleFile, altText, caption, visibility);
    if (error) {
      setSingleError(error.message);
    } else if (data) {
      setSingleFile(null);
      setAltText('');
      setCaption('');
      showNotification(`Asset "${data.original_filename}" uploaded successfully!`);
      fetchAssets();
    }
    setSingleUploading(false);
  };

  // Batch upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setBatchFiles((prev) => [...prev, ...dropped]);
    }
  };

  const handleBatchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setBatchFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveBatchFile = (index: number) => {
    setBatchFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteBatchUpload = async () => {
    if (batchFiles.length === 0) return;

    setBatchUploading(true);
    setBatchResult(null);
    setBatchProgress({ completed: 0, total: batchFiles.length });

    const result = await uploadMediaBatch(
      batchFiles,
      visibility,
      (completed, total) => setBatchProgress({ completed, total })
    );

    setBatchResult(result);
    setBatchUploading(false);
    setBatchFiles([]);
    fetchAssets();

    if (result.successful.length > 0) {
      showNotification(`Uploaded ${result.successful.length} assets successfully!`);
    }
  };

  // Clipboard copy
  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.storage_path);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Deletion with usage safety check
  const initiateDelete = async (asset: MediaAsset) => {
    setCheckingAssetId(asset.id);
    const report = await checkMediaUsage(asset);
    setCheckingAssetId(null);
    setDeleteCandidate(asset);
    setUsageReport(report);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;

    setDeleting(true);
    const { error } = await deleteMediaAsset(deleteCandidate);
    setDeleting(false);

    if (!error) {
      setAssets((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      showNotification(`Asset "${deleteCandidate.original_filename}" deleted.`);
      setDeleteCandidate(null);
      setUsageReport(null);
    } else {
      showNotification(`Delete failed: ${error.message}`, 'error');
    }
  };

  // Filtered & Sorted Asset List
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        // Search match
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          asset.original_filename.toLowerCase().includes(query) ||
          (asset.alt_text && asset.alt_text.toLowerCase().includes(query)) ||
          (asset.caption && asset.caption.toLowerCase().includes(query));

        // Media type match
        const matchesType =
          typeFilter === 'all' ||
          (typeFilter === 'image' && asset.media_type === 'image') ||
          (typeFilter === 'document' && (asset.media_type === 'document' || asset.mime_type.includes('pdf'))) ||
          (typeFilter === 'audio' && asset.media_type === 'audio');

        // Visibility match
        const matchesVisibility =
          visibilityFilter === 'all' || asset.visibility === visibilityFilter;

        return matchesSearch && matchesType && matchesVisibility;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'size_desc') {
          return b.size_bytes - a.size_bytes;
        }
        if (sortBy === 'size_asc') {
          return a.size_bytes - b.size_bytes;
        }
        if (sortBy === 'name_asc') {
          return a.original_filename.localeCompare(b.original_filename);
        }
        return 0;
      });
  }, [assets, searchQuery, typeFilter, visibilityFilter, sortBy]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8'
              }}
            >
              Enterprise Asset Hub
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Storage & Deduplication Engine
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 4px' }}>
            Media Library & Asset Manager
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-sm)', margin: 0 }}>
            Upload, inspect references, and manage high-resolution assets for curriculum lessons, hero slides, and educational blogs.
          </p>
        </div>

        {/* Upload Mode Selector */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--color-surface)', padding: '4px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={() => setUploadMode('batch')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: uploadMode === 'batch' ? '#2563eb' : 'transparent',
              color: uploadMode === 'batch' ? '#ffffff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            <span>Batch Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('single')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: uploadMode === 'single' ? '#2563eb' : 'transparent',
              color: uploadMode === 'single' ? '#ffffff' : 'var(--color-text-secondary)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Upload size={14} />
            <span>Single File</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: notification.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: notification.type === 'success' ? '#22c55e' : '#ef4444',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Uploader Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        {uploadMode === 'batch' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 2px', color: 'var(--color-text-primary)' }}>
                  Multi-File Batch Drag & Drop Upload
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Supports simultaneous multi-file ingestion with automatic duplicate detection
                </span>
              </div>

              {/* Bucket selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  Visibility:
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                  style={{
                    height: '32px',
                    padding: '0 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.75rem'
                  }}
                >
                  <option value="public">Public Media (Website images, blogs)</option>
                  <option value="private">Private (Restricted learner downloads)</option>
                </select>
              </div>
            </div>

            {/* Dropzone Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#2563eb' : 'var(--color-border)'}`,
                backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.08)' : 'var(--color-surface-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
                onChange={handleBatchFileSelect}
                style={{ display: 'none' }}
              />
              <Upload size={36} style={{ color: isDragging ? '#2563eb' : 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                Drag and drop files here, or <span style={{ color: '#38bdf8' }}>browse your computer</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Supports JPG, PNG, WebP, GIF, SVG, and PDF documents (Up to 10MB each)
              </p>
            </div>

            {/* Selected Files Staging List */}
            {batchFiles.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Files queued for upload ({batchFiles.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setBatchFiles([])}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {batchFiles.map((file, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-elevated)',
                        fontSize: '0.75rem',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={14} style={{ color: '#38bdf8' }} />
                        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{file.name}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBatchFile(idx);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center' }}>
                  {batchProgress && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                      Uploading {batchProgress.completed} of {batchProgress.total}...
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={batchUploading}
                    onClick={handleExecuteBatchUpload}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: batchUploading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    {batchUploading ? <Loader2 size={16} className="spin" /> : <Upload size={16} />}
                    <span>{batchUploading ? 'Processing Batch...' : `Upload ${batchFiles.length} Assets`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Batch Upload Summary Result */}
            {batchResult && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                  Batch Upload Complete:
                </div>
                <div style={{ color: '#22c55e' }}>✓ {batchResult.successful.length} file(s) uploaded successfully.</div>
                {batchResult.duplicates.length > 0 && (
                  <div style={{ color: '#f59e0b', marginTop: '2px' }}>
                    ⚠ {batchResult.duplicates.length} duplicate file(s) skipped (existing asset preserved).
                  </div>
                )}
                {batchResult.errors.length > 0 && (
                  <div style={{ color: '#ef4444', marginTop: '2px' }}>
                    ✕ {batchResult.errors.length} file(s) failed: {batchResult.errors[0]?.error}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
              Upload Single Media Asset with Custom Metadata
            </h3>

            {singleError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '16px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}
              >
                <AlertCircle size={16} />
                <span>{singleError}</span>
              </div>
            )}

            <form onSubmit={handleSingleUpload}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Select File (JPG, PNG, WebP, GIF, SVG, PDF • Max 10MB) *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
                    onChange={handleSingleFileChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Accessibility Alt Text *
                  </label>
                  <input
                    type="text"
                    required
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Meaningful description for screen readers and SEO"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                    Visibility Bucket
                  </label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value="public">Public Media (Website images, blogs, hero)</option>
                    <option value="private">Private (Restricted learner downloads only)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={singleUploading || !singleFile}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: singleUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Upload size={16} />
                  <span>{singleUploading ? 'Uploading...' : 'Upload Media Asset'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search by filename or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '36px',
              padding: '0 12px 0 38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Media Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              height: '36px',
              padding: '0 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem'
            }}
          >
            <option value="all">All Media Types</option>
            <option value="image">Images (JPG, PNG, WebP, SVG)</option>
            <option value="document">Documents (PDFs)</option>
            <option value="audio">Audio Files</option>
          </select>
        </div>

        {/* Visibility Filter */}
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value)}
          style={{
            height: '36px',
            padding: '0 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '0.8125rem'
          }}
        >
          <option value="all">All Visibility</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              height: '36px',
              padding: '0 10px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8125rem'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="size_desc">File Size (Largest)</option>
            <option value="size_asc">File Size (Smallest)</option>
            <option value="name_asc">File Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Asset Library Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Cataloged Assets ({filteredAssets.length}{filteredAssets.length !== assets.length && ` of ${assets.length}`})
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-secondary)' }}>
            Loading asset catalog...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 'var(--space-12)',
              textAlign: 'center',
              borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <ImageIcon size={44} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
              No assets match your search
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', margin: 0 }}>
              Try adjusting your filters or use the upload box above to ingest new media files.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}
          >
            {filteredAssets.map((asset) => {
              const isChecking = checkingAssetId === asset.id;

              return (
                <div
                  key={asset.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                >
                  {/* Media Visual Preview */}
                  <div style={{ height: '150px', backgroundColor: 'var(--color-surface-elevated)', position: 'relative', overflow: 'hidden' }}>
                    {asset.media_type === 'image' ? (
                      <img
                        src={asset.storage_path}
                        alt={asset.alt_text}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <FileText size={42} style={{ color: '#38bdf8' }} />
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                          {asset.mime_type.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Visibility Badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(4px)',
                        color: asset.visibility === 'public' ? '#38bdf8' : '#c084fc',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontWeight: 700
                      }}
                    >
                      {asset.visibility}
                    </span>

                    {/* Full external view link */}
                    <a
                      href={asset.storage_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full resolution in new tab"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        padding: '4px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Metadata and Actions */}
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div
                      title={asset.original_filename}
                      style={{
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-primary)',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        marginBottom: '4px'
                      }}
                    >
                      {asset.original_filename}
                    </div>

                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{(asset.size_bytes / 1024).toFixed(0)} KB</span>
                      <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                    </div>

                    {asset.alt_text && (
                      <div
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '10px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}
                        title={asset.alt_text}
                      >
                        {asset.alt_text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                          color: copiedId === asset.id ? '#10b981' : 'var(--color-text-primary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === asset.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedId === asset.id ? 'Copied' : 'Copy URL'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => initiateDelete(asset)}
                        disabled={isChecking}
                        title="Delete asset (checks active content references first)"
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          backgroundColor: 'rgba(239, 68, 68, 0.08)',
                          color: '#ef4444',
                          cursor: isChecking ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isChecking ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reference Safety & Deletion Modal */}
      {deleteCandidate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => {
            setDeleteCandidate(null);
            setUsageReport(null);
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-2xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              {usageReport?.inUse ? (
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <AlertTriangle size={24} />
                </div>
              ) : (
                <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <Trash2 size={24} />
                </div>
              )}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                {usageReport?.inUse ? 'Active References Detected' : 'Confirm Asset Deletion'}
              </h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 16px' }}>
              You are about to delete <strong>"{deleteCandidate.original_filename}"</strong>.
            </p>

            {/* In-Use Reference Details */}
            {usageReport?.inUse && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Referenced in {usageReport.locations.length} published item(s):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {usageReport.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--color-surface)',
                        padding: '6px 10px',
                        borderRadius: '4px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{loc.title}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>{loc.field}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#f59e0b', margin: '8px 0 0', lineHeight: 1.4 }}>
                  Deleting this file may result in broken images or missing syllabus downloads on the live website.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setDeleteCandidate(null);
                  setUsageReport(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: deleting ? 'not-allowed' : 'pointer'
                }}
              >
                {deleting ? 'Deleting...' : usageReport?.inUse ? 'Force Delete Anyway' : 'Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
